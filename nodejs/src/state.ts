import {VideoInfo} from './downloader';

interface BaseDownload {
  state: string;
  url: string;
  log: string[];
}

export interface PreparingDownload extends BaseDownload {
  state: 'preparing';
}

export interface ErroredDownload extends BaseDownload {
  state: 'errored';
  videoInfo?: VideoInfo;
}

export interface PreparedDownload extends BaseDownload {
  state: 'queued' | 'started' | 'finished';
  videoInfo: VideoInfo;
}

export type Download = (
  PreparingDownload |
  PreparedDownload |
  ErroredDownload
);

export interface State {
  isActive: boolean;
  downloads: Download[];
}
