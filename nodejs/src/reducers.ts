import {State, PreparedDownload, ErroredDownload} from './state';
import * as actions from './actions';

export const initialState: State = {
  isActive: true,
  log: [],
  downloads: []
};

/**
 * Return a copy of the original object with the given changes.
 */
function assign<T>(original: T, changes: Partial<T>): T {
  return Object.assign({}, original, changes);
}

/**
 * Reducer that relies on TypeScript's control flow analysis to
 * ensure that all possible actions are handled.
 *
 * However, there is a chance that undocumented actions from
 * third-party libraries might interfere with this, so this
 * function should be wrapped by another function that tests
 * to see if the return value is falsy.
 */
function app(state: State, action: actions.Action): State {
  if (!state.isActive) {
    console.warn(`Action ${action.type} received while app is inactive.`);
    return state;
  }

  console.log('Processing action', action.type);

  switch (action.type) {
    case '@@redux/INIT':
    case 'init':
      return state;

    case 'log':
      return assign(state, {
        log: state.log.concat(action.message)
      });

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

    case 'startDownload':
      return assign(state, {
        downloads: state.downloads.map(d => {
          if (d.url === action.url && d.state === 'queued') {
            const started: PreparedDownload = {
              ...d,
              state: 'started',
            };
            return started;
          }
          return d;
        })
      });

    case 'finishDownload':
      return assign(state, {
        downloads: state.downloads.map(d => {
          if (d.url === action.url && d.state === 'started') {
            const finished: PreparedDownload = {
              ...d,
              state: 'finished',
            };
            return finished;
          }
          return d;
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
            const queued: PreparedDownload = {
              ...d,
              state: 'queued',
              videoInfo: action.videoInfo
            };
            return queued;
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
}

export function downloaderApp(state: State = initialState,
                              action: actions.Action): State {
  const newState = app(state, action);

  if (!newState) {
    console.warn('Unexpected/undocumented action', action);
    return state;
  }

  return newState;
}
