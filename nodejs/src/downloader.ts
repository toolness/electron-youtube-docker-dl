import * as path from 'path';
import {Stream, Transform, PassThrough} from 'stream';
import {EventEmitter} from 'events';
import Docker = require('dockerode');
import through2 = require('through2');
import {COMMAND_FAILED} from './constants';

const BASE_OPTIONS = [
  '--restrict-filenames',
  // Download best mp4 format available or any other best if no mp4 available
  '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'
];

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
  out?: NodeJS.WritableStream,
  containerCb?: (container: Docker.Container) => void;
}

export interface VideoInfo {
  id: string;
  uploader: string;
  uploader_id: string;
  uploader_url: string;
  upload_date: string;
  license: string;
  title: string;
  thumbnail: string;
  description: string;
  categories: string[];
  tags: string[];
  duration: number;
  age_limit: number;
  webpage_url: string;
  view_count: number;
  like_count: number;
  dislike_count: number;
  average_rating: number;
  fulltitle: string;
  display_id: string;
  width: number;
  height: number;
  fps: number;
  ext: string;
  _filename: string;
}

export interface DownloadRequest {
  promise: Promise<void>;
  out: Transform;
  cancel(): void;
}

interface DockerizedDownloader {
  on(event: 'log', cb: (msg: string) => void): this;
  emit(event: 'log', msg: string): boolean;
}

class DockerizedDownloader extends EventEmitter {
  readonly docker: Docker;
  readonly image: string;
  readonly dir: string;

  constructor(options: DownloaderOptions) {
    super();

    this.docker = options.docker;
    this.image = options.image;
    this.dir = path.resolve(options.dir);

    if (process.env['COMPOSE_CONVERT_WINDOWS_PATHS'] === '1' ||
        process.env['COMPOSE_CONVERT_WINDOWS_PATHS'] === 'true') {
      this.dir = convertWindowsPath(this.dir);
    }
  }

  runInContainer(cmd: string, args: string[], options?: RunOptions): Promise<void> {
    options = options || {};

    const out = options.out || process.stdout;
    const containerCb = options.containerCb || function() {};

    return new Promise<void>((resolve, reject) => {
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
        containerCb(container);
      });
    });
  }

  async prepareHost(): Promise<void> {
  }

  async getVideoInfo(url: string): Promise<VideoInfo> {
    const dataParts: string[] = [];
    const stream = through2((chunk, enc, callback) => {
      dataParts.push(chunk.toString('ascii'));
      callback();
    });
    const parsedInfo = new Promise((resolve, reject) => {
      stream.on('finish', () => {
        const allData = dataParts.join('');
        try {
          resolve(JSON.parse(allData));
        } catch (e) {
          reject('unable to parse JSON: ' + allData);
        }
      });
    });

    await this.runInContainer('youtube-dl', BASE_OPTIONS.concat([
      '--no-warnings',
      '-j', url
    ]), {
      out: stream,
    });

    return <VideoInfo> await parsedInfo;
  }

  log(msg: string): void {
    console.log(msg);
    this.emit('log', msg);
  }

  download(url: string): DownloadRequest {
    const self = this;
    let cancel = () => {};

    // TODO: Is it OK that this promise may never be resolved/rejected,
    // or will that cause a memory leak?
    const cancelPromise = new Promise<void>((resolve) => {
      cancel = resolve;
    });

    const out = new PassThrough();

    out.pipe(process.stdout);

    const promise = this.runInContainer('youtube-dl', BASE_OPTIONS.concat([
      '--newline',
      url,
    ]), {
      out,
      containerCb(container) {
        cancelPromise.then(() => {
          self.log(`Stopping download of ${url}.`);
          container.stop({t: 1}, (err) => {
            if (err) {
              self.log('Error stopping container.');
              console.log(err);
            }
          });
        });
      }
    });

    return {
      promise: promise,
      out: out,
      cancel,
    };
  }
}

export default DockerizedDownloader;
