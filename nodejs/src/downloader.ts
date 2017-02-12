import * as path from 'path';
import {Stream} from 'stream';
import {EventEmitter} from 'events';
import Docker = require('dockerode');
import {COMMAND_FAILED} from './constants';

export function convertWindowsPath(pathname: string) {
  return pathname.replace(
    /^([A-Z])\:\\/, (_, letter) => '/' + letter.toLowerCase() + '/'
  ).replace(/\\/g, '/');
}

export interface DownloaderOptions {
  docker: Docker,
  image: string,
  dir: string,
}

export interface RunOptions {
  out?: NodeJS.WritableStream
}

export default class DockerizedDownloader {
  docker: Docker;
  image: string;
  dir: string;

  constructor(options: DownloaderOptions) {
    this.docker = options.docker;
    this.image = options.image;
    this.dir = path.resolve(options.dir);

    if (process.env['COMPOSE_CONVERT_WINDOWS_PATHS'] === '1' ||
        process.env['COMPOSE_CONVERT_WINDOWS_PATHS'] === 'true') {
      this.dir = convertWindowsPath(this.dir);
    }
  }

  runInContainer(cmd: string, args: string[], options?: RunOptions) {
    options = options || {};

    const out = options.out || process.stdout;

    return new Promise((resolve, reject) => {
      this.docker.run(this.image, [cmd, ...args], out, {
        WorkingDir: '/downloads',
      }, (err, data, container) => {
        if (err) {
          return reject(err);
        }

        container.remove((err: any) => {
          if (err) {
            return reject(err);
          }
          if (data.StatusCode !== 0) {
            return reject(new Error(COMMAND_FAILED));
          }
          resolve();
        });
      }).on('container', (container) => {
        container.defaultOptions.start.Binds = [
          this.dir + ':/downloads:rw'
        ];
      });
    });
  }

  async download(cmd: string, args: string[], options: RunOptions) {
    await this.runInContainer(cmd, args, options);
  }
}
