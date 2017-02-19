import {State, PreparedDownload, ErroredDownload} from './state';
import * as actions from './actions';

export const initialState: State = {
  isActive: true,
  downloads: []
};

/**
 * Return a copy of the original object with the given changes.
 */
function assign<T>(original: T, changes: Partial<T>): T {
  return Object.assign({}, original, changes);
}

export function downloaderApp(state: State = initialState,
                              action: actions.Action): State {
  if (!state.isActive) {
    console.warn(`Action ${action.type} received while app is inactive.`);
    return state;
  }

  console.log('Processing action', action.type);

  switch (action.type) {
    case 'enqueueDownload':
      if (state.downloads.some(d => d.url === action.url)) {
        console.log(`Not enqueuing ${action.url}, it already exists.`);
        return state;
      }
      return assign(state, {
        downloads: state.downloads.concat({
          state: 'preparing',
          url: action.url,
          log: []
        })
      });
    case 'cancelDownload':
      return assign(state, {
        downloads: state.downloads.filter(d => {
          return d.url !== action.url;
        })
      });
    case 'downloadPrepared':
      return assign(state, {
        downloads: state.downloads.map(d => {
          if (d.url === action.url) {
            const prepared: PreparedDownload = {
              ...d,
              state: 'queued',
              videoInfo: action.videoInfo
            };
            return prepared;
          }
          return d;
        })
      });
    case 'downloadError':
      return assign(state, {
        downloads: state.downloads.map(d => {
          if (d.url === action.url) {
            const errored: ErroredDownload = {
              ...d,
              state: 'errored',
              log: d.log.concat(action.message)
            };
            return errored;
          }
          return d;
        })
      });
  }

  return state;
}
