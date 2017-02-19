import {app, BrowserWindow, ipcMain} from 'electron';
import {createStore, applyMiddleware} from 'redux';
import * as url from 'url';
import * as path from 'path';

import * as actions from './actions';
import {State} from './state';
import {downloaderApp, initialState} from './reducers';
import {StateSaver} from './state-saver';
import {StateDownloader} from './state-downloader';
import getDownloader from './get-downloader';

const rootDir = path.normalize(path.join(__dirname, '..', '..'));
const stateSaver = new StateSaver(path.join(rootDir, 'state.json'));
const stateDownloader = new StateDownloader(getDownloader());
const store = createStore<State>(
  downloaderApp,
  stateSaver.loadSync(initialState),
  applyMiddleware(stateSaver.middleware, stateDownloader.middleware)
);
let win;

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

  // TODO: This is just sample code, remove it eventually.
  store.dispatch(actions.enqueueDownload('http://boop'));
  store.dispatch(actions.enqueueDownload('https://www.youtube.com/watch?v=y7afWRBNXwQ'));
});

ipcMain.on('download', (event, url: string) => {
  console.log('TODO: Start download of ' + url);
});
