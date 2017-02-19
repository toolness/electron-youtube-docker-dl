import {app, BrowserWindow, ipcMain} from 'electron';
import {createStore, applyMiddleware} from 'redux';
import * as url from 'url';
import * as path from 'path';

import * as actions from './actions';
import {State} from './state';
import {downloaderApp, initialState} from './reducers';
import {StateSaver} from './state-saver';

let rootDir = path.normalize(path.join(__dirname, '..', '..'));
let stateSaver = new StateSaver(path.join(rootDir, 'state.json'));
let store = createStore<State>(
  downloaderApp,
  stateSaver.loadSync(initialState),
  applyMiddleware(stateSaver.middleware)
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

  // TODO: This is just sample code, remove it eventually.
  store.dispatch(actions.enqueueDownload('http://boop'));
});

ipcMain.on('download', (event, url: string) => {
  console.log('TODO: Start download of ' + url);
});
