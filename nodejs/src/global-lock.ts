type Releaser = () => void;

export default class GlobalLock {
  private lock: Promise<void>;

  constructor() {
    this.lock = new Promise<void>(resolve => resolve());
  }

  async acquire(): Promise<Releaser> {
    await this.lock;
    let resolver: Releaser = () => {};
    this.lock = new Promise<void>((resolve, reject) => {
      resolver = resolve;
    });
    return resolver;
  }
}
