import React = require('react');
import ReactDOM = require('react-dom');
import {Provider} from 'react-redux';
import {ipcRenderer} from 'electron';
import {createStore, applyMiddleware,
        MiddlewareAPI, Dispatch} from 'redux';

import App from './app';
import {State} from '../state';
import * as actions from '../actions';
import {downloaderApp} from '../reducers';

ipcRenderer.on('currentState', (event, state: State) => {
  const syncActionsToMainMiddleware =
    (store: MiddlewareAPI<State>) =>
    (next: Dispatch<State>) =>
    (action: actions.Action): actions.Action => {
      const result = next(action);

      if (action.origin !== 'main') {
        ipcRenderer.send('action', action);
      }

      return result;
  };
  const store = createStore<State>(
    downloaderApp,
    state,
    applyMiddleware(syncActionsToMainMiddleware)
  );
  console.log('wooot hello', state);

  ipcRenderer.on('action', (event, action: actions.SyncableAction) => {
    action.origin = 'main';
    store.dispatch(action);
    console.log('got action', action, store.getState());
  });

  ReactDOM.render(
    <Provider store={store}>
      <App/>
    </Provider>,
    document.getElementById('app')
  );
});
