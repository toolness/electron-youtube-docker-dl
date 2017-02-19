type Releaser = () => void;

export default class GlobalLock {
  __lock?: Promise<void>;

  constructor() {
    this.__lock = new Promise<void>(resolve => resolve());
  }

  async acquire(): Promise<Releaser> {
    await this.__lock;
    let resolver: Releaser = () => {};
    this.__lock = new Promise<void>((resolve, reject) => {
      resolver = resolve;
    });
    return resolver;
  }
}
