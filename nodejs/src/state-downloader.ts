import {MiddlewareAPI, Dispatch} from 'redux';

import DockerizedDownloader from './downloader';
import {stringifyError} from './util';
import {VideoInfo} from './downloader';
import {Action, downloadPrepared, downloadError} from './actions';
import {State, PreparingDownload} from './state';

export class StateDownloader {
  readonly downloader: DockerizedDownloader;
  private videoInfoRequests: Map<string, Promise<VideoInfo>>;

  constructor(downloader: DockerizedDownloader) {
    this.downloader = downloader;
    this.videoInfoRequests = new Map();
  }

  private async prepare(download: PreparingDownload): Promise<VideoInfo> {
    await this.downloader.prepareHost();

    return await this.downloader.getVideoInfo(download.url);
  }

  private prepareAll(store: MiddlewareAPI<State>): void {
    const state = store.getState();

    state.downloads.forEach(download => {
      if (download.state === 'preparing') {
        if (!this.videoInfoRequests.has(download.url)) {
          console.log('Preparing', download.url);
          const promise = this.prepare(download);
          this.videoInfoRequests.set(download.url, promise);
          promise.then(info => {
            this.videoInfoRequests.delete(download.url);
            store.dispatch(downloadPrepared(download.url, info));
          }).catch(err => {
            const msg = `Fetching metadata failed: ${stringifyError(err)}`;
            store.dispatch(downloadError(download.url, msg));
            console.log('Error preparing', download.url);
          });
        }
      }
    });
  }

  middleware = (store: MiddlewareAPI<State>) =>
    (next: Dispatch<State>) =>
    (action: Action): Action => {
      const result = next(action);

      this.prepareAll(store);

      return result;
  }
}
