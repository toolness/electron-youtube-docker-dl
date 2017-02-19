import {VideoInfo} from './downloader';

interface BaseDownload {
  state: string;
  url: string;
  log: string[];
}

interface PreparingDownload extends BaseDownload {
  state: 'preparing';
}

interface ErroredDownload extends BaseDownload {
  state: 'errored';
  videoInfo?: VideoInfo;
}

interface PreparedDownload extends BaseDownload {
  state: 'queued' | 'started' | 'finished';
  videoInfo: VideoInfo;
}

type Download = PreparingDownload | PreparedDownload | ErroredDownload;

export interface State {
  isActive: boolean;
  downloads: Download[];
}
