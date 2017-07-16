import {MiddlewareAPI, Dispatch} from 'redux';
import * as path from 'path';
import * as fs from 'fs';
import through2 = require('through2');

import {DOWNLOAD_DIR} from './constants';
import DockerizedDownloader from './downloader';
import {DownloadRequest, toInfoJsonPath} from './downloader';
import {stringifyError} from './util';
import {VideoInfo} from './downloader';
import {Action, downloadPrepared, downloadError, log,
        startDownload, finishDownload, downloadLog} from './actions';
import {State, Download, PreparingDownload,
        PreparedDownload} from './state';

export class StateDownloader {
  readonly downloader: DockerizedDownloader;
  private videoInfoRequests = new Map<string, Promise<VideoInfo>>();
  private downloadRequests = new Map<string, Promise<DownloadRequest>>();

  constructor(downloader: DockerizedDownloader) {
    this.downloader = downloader;
  }

  private async prepare(download: PreparingDownload): Promise<VideoInfo> {
    await this.downloader.prepareHost();

    return await this.downloader.getVideoInfo(download.url);
  }

  private prepareAll(downloads: Download[],
                     dispatch: Dispatch<State>): void {
    downloads.forEach(download => {
      if (download.state === 'preparing') {
        if (!this.videoInfoRequests.has(download.url)) {
          console.log('Preparing', download.url);
          const promise = this.prepare(download);
          this.videoInfoRequests.set(download.url, promise);
          promise.then(info => {
            this.videoInfoRequests.delete(download.url);
            dispatch(downloadPrepared(download.url, info));
          }).catch(err => {
            this.videoInfoRequests.delete(download.url);
            const msg = `Fetching metadata failed: ${stringifyError(err)}`;
            dispatch(downloadError(download.url, msg));
            console.log('Error preparing', download.url);
          });
        }
      }
    });
  }

  private async download(download: PreparedDownload): Promise<DownloadRequest> {
    await this.downloader.prepareHost();

    return this.downloader.download(download.url, download.videoInfo);
  }

  private startNextDownload(downloads: Download[],
                            dispatch: Dispatch<State>): void {
    for (let i = 0; i < downloads.length; i++) {
      const d = downloads[i];
      if (d.state === 'started') {
        if (!this.downloadRequests.has(d.url)) {
          const promise = this.download(d);
          this.downloadRequests.set(d.url, promise);

          const reportError = (err: any): void => {
            this.downloadRequests.delete(d.url);
            const msg = `Downloading failed: ${stringifyError(err)}`;
            dispatch(downloadError(d.url, msg));
            console.log('Error downloading', d.url);
          };

          promise.then((req) => {
            // Disabling this for now--if youtube-dl is in its weird mode
            // where it's spamming progress updates really fast, this
            // seems to slow things down considerably and lock up the
            // renderer process.
            //
            // req.out.pipe(through2((chunk, enc, callback) => {
            //   dispatch(downloadLog(d.url, chunk.toString('ascii')));
            //   callback();
            // }));
            req.promise.then(() => {
              this.downloadRequests.delete(d.url);
              dispatch(finishDownload(d.url));
            }).catch(reportError);
          }).catch(reportError);
        }
        return;
      }
      if (d.state === 'queued') {
        dispatch(startDownload(d.url));
        return;
      }
    }
  }

  private cancel(download: Download) {
    const promise = this.downloadRequests.get(download.url);
    if (promise) {
      console.log('Scheduling cancellation of download', download.url);
      promise.then(req => { req.cancel(); });
    }
  }

  private cancelAll(downloads: Download[]) {
    downloads.forEach(d => this.cancel(d));
  }

  private tryRemoving(filePath: string) {
    console.log('Checking for existence of', filePath);
    if (fs.existsSync(filePath)) {
      console.log('File exists, removing it.');
      fs.unlinkSync(filePath);
    }
  }

  private handleCancelOrRemove(url: string, downloads: Download[]) {
    downloads.forEach(d => {
      if (d.url === url) {
        if (d.state === 'started') {
          this.cancel(d);
        } else if (d.state === 'finished') {
          const filePath = path.join(DOWNLOAD_DIR, d.videoInfo._filename);
          this.tryRemoving(filePath);
          this.tryRemoving(toInfoJsonPath(filePath));
        }
      }
    });
  }

  middleware = (store: MiddlewareAPI<State>) =>
    (next: Dispatch<State>) =>
    (action: Action): Action => {
      const prevState = store.getState();

      if (action.type === 'cancelDownload') {
        this.handleCancelOrRemove(action.url, prevState.downloads);
      }

      const result = next(action);
      const newState = store.getState();
      let processDownloads = prevState.downloads !== newState.downloads;

      if (action.type === 'init') {
        this.downloader.on('log', message => {
          store.dispatch(log(message + '\n'));
        });
        processDownloads = true;
      } else if (action.type === 'shutdown') {
        this.cancelAll(newState.downloads);
      }
      if (newState.isShuttingDown) {
        processDownloads = false;
      }

      if (processDownloads) {
        this.prepareAll(newState.downloads, store.dispatch);
        this.startNextDownload(newState.downloads, store.dispatch);
      }

      return result;
  }
}
