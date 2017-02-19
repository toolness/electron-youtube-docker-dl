import {MiddlewareAPI, Dispatch} from 'redux';

import DockerizedDownloader from './downloader';
import {VideoInfo} from './downloader';
import {Action, downloadPrepared, downloadError} from './actions';
import {State, PreparingDownload} from './state';

new Map<string, Promise<VideoInfo>>();

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
        console.log('Preparing', download.url);
        if (!this.videoInfoRequests.has(download.url)) {
          const promise = this.prepare(download);
          this.videoInfoRequests.set(download.url, promise);
          promise.then(info => {
            this.videoInfoRequests.delete(download.url);
            store.dispatch(downloadPrepared(download.url, info));
          }).catch(err => {
            store.dispatch(downloadError(download.url, err));
            console.log('Error preparing', download.url, err);
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
