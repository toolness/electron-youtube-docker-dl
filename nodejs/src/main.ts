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

const store = createStore<State>(
  downloaderApp,
  stateSaver.loadSync(initialState),
  applyMiddleware(
    stateSaver.middleware,
    stateDownloader.middleware,
    syncActionsToWindowMiddleware
  )
);

app.on('ready', () => {
  win = new BrowserWindow({
    width: 800,
    height: 600
  });

  win.loadURL(url.format({
    pathname: path.join(__dirname, '..', '..', 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.webContents.openDevTools();

  store.dispatch(actions.init());

  win.webContents.on('did-finish-load', () => {
    if (win) {
      win.webContents.send('currentState', store.getState());
    }
  });
  win.on('closed', () => {
    win = null;
  });

  // TODO: This is just sample code, remove it eventually.
  store.dispatch(actions.enqueueDownload('http://boop'));
  store.dispatch(actions.enqueueDownload('https://www.youtube.com/watch?v=y7afWRBNXwQ'));
});

app.on('window-all-closed', () => {
  // TODO: Gracefully stop all downloads.
  app.quit();
});

ipcMain.on('action', (event, action: actions.SyncableAction) => {
  action.origin = 'renderer';
  console.log('got action from renderer', action);
  store.dispatch(action);
});
