import {MiddlewareAPI, Dispatch} from 'redux';

import DockerizedDownloader from './downloader';
import {DownloadRequest} from './downloader';
import {stringifyError} from './util';
import {VideoInfo} from './downloader';
import {Action, downloadPrepared, downloadError, log,
        startDownload, finishDownload} from './actions';
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

    return this.downloader.download(download.url);
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
            // TODO: Send output of request to download log.
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

  middleware = (store: MiddlewareAPI<State>) =>
    (next: Dispatch<State>) =>
    (action: Action): Action => {
      const prevState = store.getState();
      const result = next(action);
      const newState = store.getState();
      let processDownloads = prevState.downloads !== newState.downloads;

      if (action.type === 'init') {
        this.downloader.on('log', message => {
          store.dispatch(log(message));
        });
        processDownloads = true;
      }

      if (processDownloads) {
        this.prepareAll(newState.downloads, store.dispatch);
        this.startNextDownload(newState.downloads, store.dispatch);
      }

      return result;
  }
}
