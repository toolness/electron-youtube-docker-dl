import {VideoInfo} from './downloader';

interface LogAction {
  type: 'log';
  message: string;
}

interface SimpleUrlAction {
  type: 'enqueueDownload' | 'cancelDownload';
  url: string;
}

interface PreparedAction {
  type: 'downloadPrepared';
  url: string;
  videoInfo: VideoInfo;
}

interface ErrorAction {
  type: 'downloadError';
  url: string;
  message: string;
}

export type Action = (
  LogAction |
  SimpleUrlAction |
  PreparedAction |
  ErrorAction
);

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
