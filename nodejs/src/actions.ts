import {VideoInfo} from './downloader';

export interface SyncableAction {
  type: string;
  origin?: 'renderer' | 'main';
}

interface LogAction extends SyncableAction {
  type: 'log';
  message: string;
}

interface SimpleUrlAction extends SyncableAction {
  type: 'enqueueDownload' | 'startDownload' | 'finishDownload' |
        'cancelDownload';
  url: string;
}

interface PreparedAction extends SyncableAction {
  type: 'downloadPrepared';
  url: string;
  videoInfo: VideoInfo;
}

interface ErrorAction extends SyncableAction {
  type: 'downloadError';
  url: string;
  message: string;
}

export type Action = (
  {type: 'init', origin?: undefined} |
  {type: '@@redux/INIT', origin?: undefined} |
  LogAction |
  SimpleUrlAction |
  PreparedAction |
  ErrorAction
);

/**
 * First-time intialization, run at startup.
 */
export function init(): Action {
  return {type: 'init'};
};

/**
 * Log a generic message that isn't specific to a particular download.
 */
export function log(message: string): LogAction {
  return {type: 'log', message};
}

/**
 * Enqueue a video for being downloaded, adding it to the
 * end of the queue.
 */
export function enqueueDownload(url: string): SimpleUrlAction {
  return {type: 'enqueueDownload', url};
}

/**
 * Start a download.
 */
export function startDownload(url: string): SimpleUrlAction {
  return {type: 'startDownload', url};
}

/**
 * Successfully finish a download.
 */
export function finishDownload(url: string): SimpleUrlAction {
  return {type: 'finishDownload', url};
}

/**
 * Cancel a download, removing it from the download queue.
 */
export function cancelDownload(url: string): SimpleUrlAction {
  return {type: 'cancelDownload', url};
}

/**
 * Signal that a download is prepared, i.e. that its metadata has
 * been retrieved.
 */
export function downloadPrepared(url: string,
                                 videoInfo: VideoInfo): PreparedAction {
  return {type: 'downloadPrepared', url, videoInfo};
}

/**
 * Signal that an error occurred while trying to download.
 */
export function downloadError(url: string, message: string): ErrorAction {
  return {type: 'downloadError', url, message};
}
