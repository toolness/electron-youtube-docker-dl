import {EventEmitter} from 'events';

declare interface RunOptions {
  WorkingDir: string;
}

declare interface DockerodeOptions {
  host: string,
  port: number,
  ca: string,
  key: string,
  cert: string,
  version: string
}

declare class Container {
  remove(cb: (err: any) => void): void;
}

type RunCallback = (err: any, data: any, container: Container) => void;

declare class Dockerode {
  constructor(options: DockerodeOptions);
  run(image: string, args: string[], output: NodeJS.WritableStream, options: RunOptions, cb: RunCallback): EventEmitter;
}

export = Dockerode;
