export default class Sentinel {
  public readonly resolve: () => void;

  private readonly promise: Promise<void>;

  constructor() {
    let res: () => void;
    this.promise = new Promise((resolve) => {
      res = resolve;
    });
    this.resolve = res!;
  }

  public await = (): Promise<void> => this.promise;
}
