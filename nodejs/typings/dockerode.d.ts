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

declare namespace Dockerode {
  interface Container {
    id: string;
    remove(cb: (err: any) => void): void;
    stop(options: {t?: number}, cb: (err: any, data: any) => void): void;
    defaultOptions: {
      start: {
        Binds: string[]
      }
    }
  }

  interface RunEmitter extends EventEmitter {
    on(event: 'container', listener: (c: Dockerode.Container) => void): this;
    on(event: 'start', listener: (c: Dockerode.Container) => void): this;
  }
}

type RunCallback = (err: any, data: any, container: Dockerode.Container) => void;

declare class Dockerode {
  constructor(options: DockerodeOptions);
  run(image: string, args: string[], output: NodeJS.WritableStream, options: RunOptions, cb: RunCallback): Dockerode.RunEmitter;
}

export = Dockerode;
