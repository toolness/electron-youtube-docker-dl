import {createStore} from 'redux';

import {State} from './state';
import * as actions from './actions';

const initialState: State = {
  isActive: true,
  downloads: []
};

function downloaderApp(state: State = initialState,
                       action: actions.Action): State {
  if (!state.isActive) {
    console.warn(`Action ${action.type} received while app is inactive.`);
    return state;
  }

  switch (action.type) {
    case 'enqueueDownload':
      return Object.assign({}, state, {
        downloads: state.downloads.concat({
          state: 'preparing',
          url: action.url,
          log: []
        })
      });
    case 'cancelDownload':
      return Object.assign({}, state, {
        downloads: state.downloads.filter(d => {
          return d.url !== action.url;
        })
      });
  }
}

let store = createStore(downloaderApp);

if (module.parent === null) {
  // TODO: This is just sample code, remove it eventually.
  store.dispatch(actions.enqueueDownload('http://boop'));
}
