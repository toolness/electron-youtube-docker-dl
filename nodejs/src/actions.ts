interface SimpleUrlAction {
  type: 'enqueueDownload' | 'cancelDownload';
  url: string;
}

export type Action = SimpleUrlAction;

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
