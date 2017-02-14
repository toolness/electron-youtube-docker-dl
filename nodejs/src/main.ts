import {app, BrowserWindow, ipcMain} from 'electron';
import * as url from 'url';
import * as path from 'path';

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
});

ipcMain.on('download', (event, url: string) => {
  console.log('TODO: Start download of ' + url);
});
