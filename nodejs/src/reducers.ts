import {State, PreparedDownload, ErroredDownload} from './state';
import * as actions from './actions';

export const initialState: State = {
  isActive: true,
  downloads: []
};

export function downloaderApp(state: State = initialState,
                              action: actions.Action): State {
  if (!state.isActive) {
    console.warn(`Action ${action.type} received while app is inactive.`);
    return state;
  }

  console.log(action.type);

  switch (action.type) {
    case 'enqueueDownload':
      if (state.downloads.some(d => d.url === action.url)) {
        console.log(`Not enqueuing ${action.url}, it already exists.`);
        return state;
      }
      return {
        ...state,
        downloads: state.downloads.concat({
          state: 'preparing',
          url: action.url,
          log: []
        })
      };
    case 'cancelDownload':
      return {
        ...state,
        downloads: state.downloads.filter(d => {
          return d.url !== action.url;
        })
      };
    case 'downloadPrepared':
      return {
        ...state,
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
      };
    case 'downloadError':
      return {
        ...state,
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
      };
  }

  return state;
}
