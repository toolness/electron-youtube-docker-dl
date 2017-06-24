import {app, BrowserWindow, ipcMain} from 'electron';
import {createStore, applyMiddleware,
        MiddlewareAPI, Dispatch} from 'redux';
import * as url from 'url';
import * as path from 'path';

import * as actions from './actions';
import {State} from './state';
import {downloaderApp, initialState} from './reducers';
import {StateSaver} from './state-saver';
import {StateDownloader} from './state-downloader';
import getDownloader from './get-downloader';

let win: Electron.BrowserWindow | null = null;
const rootDir = path.normalize(path.join(__dirname, '..', '..'));

const stateSaver = new StateSaver(path.join(rootDir, 'state.json'));
const stateDownloader = new StateDownloader(getDownloader());
const syncActionsToWindowMiddleware =
  (store: MiddlewareAPI<State>) =>
  (next: Dispatch<State>) =>
  (action: actions.Action): actions.Action => {
    const result = next(action);

    if (win && !win.webContents.isLoading() &&
        action.origin !== 'renderer') {
      win.webContents.send('action', action);
    }

    return result;
};
const shutdownMiddleware =
  (store: MiddlewareAPI<State>) =>
  (next: Dispatch<State>) =>
  (action: actions.Action): actions.Action => {
    const result = next(action);
    const state = store.getState();

    if (state.isShuttingDown) {
      if (!state.downloads.some(d => d.state === 'preparing' ||
                                d.state === 'started')) {
        console.log("All downloads stopped, shutting down cleanly.");
        app.exit(0);
      }
    }

    return result;
};

const store = createStore<State>(
  downloaderApp,
  stateSaver.loadSync(initialState),
  applyMiddleware(
    stateSaver.middleware,
    stateDownloader.middleware,
    syncActionsToWindowMiddleware,
    shutdownMiddleware,
  )
);

app.on('ready', () => {
  win = new BrowserWindow({
    webPreferences: {
      // This is for CSS grid support.
      experimentalFeatures: true,
    },
    width: 800,
    height: 600
  });

  win.loadURL(url.format({
    pathname: path.join(__dirname, '..', '..', 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  //win.webContents.openDevTools();

  store.dispatch(actions.init());

  win.webContents.on('did-finish-load', () => {
    if (win) {
      win.webContents.send('currentState', store.getState());
    }
  });
  win.on('closed', () => {
    win = null;
  });
});

app.on('will-quit', (e) => {
  e.preventDefault();
  store.dispatch(actions.shutdown());
});

ipcMain.on('action', (event: any, action: actions.SyncableAction) => {
  action.origin = 'renderer';
  console.log('got action from renderer', action);
  store.dispatch(action);
});
