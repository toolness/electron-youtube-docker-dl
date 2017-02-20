import * as path from 'path';
import * as fs from 'fs';
import {Stream, Transform, PassThrough} from 'stream';
import {EventEmitter} from 'events';
import Docker = require('dockerode');
import through2 = require('through2');
import {COMMAND_FAILED} from './constants';

// https://github.com/rg3/youtube-dl/blob/master/README.md#options
const BASE_OPTIONS = [
  '--no-color',
  '--restrict-filenames',
  '--no-playlist',
  // Download best mp4 format available or any other best if no mp4 available
  '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'
];

const CONTAINER_DOWNLOAD_DIR = '/downloads';
const STOP_TIMEOUT = 3;

export function toInfoJsonPath(filePath: string) {
  let parsed = path.parse(filePath);
  delete parsed['base'];
  parsed.ext = '.info.json';
  return path.format(parsed);
}

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
  startCb?: (container: Docker.Container) => void;
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

export const exampleVideoInfo = {
  id: '',
  uploader: '',
  uploader_id: '',
  uploader_url: '',
  upload_date: '',
  license: '',
  title: '',
  thumbnail: '',
  description: '',
  categories: [],
  tags: [],
  duration: 0,
  age_limit: 0,
  webpage_url: '',
  view_count: 0,
  like_count: 0,
  dislike_count: 0,
  average_rating: 0,
  fulltitle: '',
  display_id: '',
  width: 0,
  height: 0,
  fps: 0,
  ext: '',
  _filename: '',
};

export interface DownloadRequest {
  promise: Promise<void>;
  out: Transform;
  cancel(): void;
}

interface DockerizedDownloader {
  on(event: 'log', cb: (msg: string) => void): this;
  emit(event: 'log', msg: string): boolean;
}

export function cleanVideoInfo(info: any): VideoInfo {
  let key: keyof VideoInfo;
  for (key in exampleVideoInfo) {
    if (key in info) {
      let infoType = typeof(info[key]);
      let expectedType = typeof(exampleVideoInfo[key]);
      if (infoType !== expectedType) {
        console.warn(`Expected "${key}" to be a ${expectedType} ` +
                     `but it is a ${infoType}`);
      }
    } else {
      console.warn(`Expected "${key}" to be in video info`);
    }
  }

  for (let ikey in info) {
    if (!(ikey in exampleVideoInfo)) {
      delete info[ikey];
    }
  }

  return <VideoInfo> info;
}

class DockerizedDownloader extends EventEmitter {
  readonly docker: Docker;
  readonly image: string;
  readonly dir: string;
  readonly nativeDir: string;

  constructor(options: DownloaderOptions) {
    super();

    this.docker = options.docker;
    this.image = options.image;
    this.dir = path.resolve(options.dir);
    this.nativeDir = this.dir;

    if (process.env['COMPOSE_CONVERT_WINDOWS_PATHS'] === '1' ||
        process.env['COMPOSE_CONVERT_WINDOWS_PATHS'] === 'true') {
      this.dir = convertWindowsPath(this.dir);
    }
  }

  stopAndRemoveContainer(container: Docker.Container): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      container.stop({t: STOP_TIMEOUT}, (err) => {
        if (err) {
          return reject(err);
        }
        container.remove((err: any) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });
  }

  runInContainer(cmd: string, args: string[], options?: RunOptions): Promise<void> {
    options = options || {};

    const out = options.out || process.stdout;
    const containerCb = options.containerCb || function() {};
    const startCb = options.startCb || function() {};

    return new Promise<void>((resolve, reject) => {
      this.docker.run(this.image, [cmd, ...args], out, {
        WorkingDir: CONTAINER_DOWNLOAD_DIR,
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
          `${this.dir}:${CONTAINER_DOWNLOAD_DIR}:rw`
        ];
        containerCb(container);
      }).on('start', startCb);
    });
  }

  async prepareHost(): Promise<void> {
  }

  private absInfoJsonPath(info: VideoInfo) {
    return path.join(this.nativeDir, toInfoJsonPath(info._filename));
  }

  async getVideoInfo(url: string): Promise<VideoInfo> {
    const dataParts: string[] = [];
    const stream = through2((chunk, enc, callback) => {
      dataParts.push(chunk.toString('ascii'));
      callback();
    });
    const streamFinished = new Promise<string>((resolve) => {
      stream.on('finish', () => {
        resolve(dataParts.join(''));
      });
    });

    try {
      await this.runInContainer('youtube-dl', BASE_OPTIONS.concat([
        '--no-warnings',
        '-j', url
      ]), {
        out: stream,
      });
    } catch (err) {
      if (err && err.message === COMMAND_FAILED) {
        const errorOutput = await streamFinished;
        throw new Error(errorOutput);
      }
      throw err;
    }

    const allData = await streamFinished;
    let info;

    try {
      info = cleanVideoInfo(JSON.parse(allData));
    } catch (e) {
      throw new Error('unable to parse and validate JSON: ' + allData);
    }

    fs.writeFileSync(this.absInfoJsonPath(info), allData);
    return info;
  }

  log(msg: string): void {
    console.log(msg);
    this.emit('log', msg);
  }

  download(url: string, videoInfo?: VideoInfo): DownloadRequest {
    const self = this;
    const options = BASE_OPTIONS.slice();
    let cancel = () => {};

    if (videoInfo && fs.existsSync(this.absInfoJsonPath(videoInfo))) {
      options.push('--load-info-json',
                   toInfoJsonPath(videoInfo._filename));
    }

    // TODO: Is it OK that this promise may never be resolved/rejected,
    // or will that cause a memory leak?
    const cancelPromise = new Promise<void>((resolve) => {
      cancel = resolve;
    });

    const out = new PassThrough();

    out.pipe(process.stdout);

    const promise = this.runInContainer('youtube-dl', options.concat([
      '--newline',
      url,
    ]), {
      out,
      startCb(container) {
        cancelPromise.then(() => {
          self.stopAndRemoveContainer(container).then(() => {
            self.log('Download cancelled successfully.');
          }).catch(err => {
            self.log('An error occurred while cancelling.');
            console.log(err);
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
