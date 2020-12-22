import type Model from './Model';

export default class InMemoryModel<T> implements Model<T> {
  /* eslint-disable-next-line @typescript-eslint/unbound-method */
  public readonly read = this.get;

  public readonly validate: (v: unknown) => T;

  private readonly memory = new Map<string, T>();

  constructor(validator = (x: unknown): T => (x as T)) {
    this.validate = validator;
  }

  public set(id: string, value: T): void {
    this.memory.set(id, value);
  }

  public get(id: string): Readonly<T> | undefined {
    return this.memory.get(id);
  }

  public delete(id: string): void {
    this.memory.delete(id);
  }

  public write(id: string, newValue: T, oldValue: T): void {
    const old = this.memory.get(id);
    if (oldValue !== old) {
      throw new Error('Unexpected previous value');
    }
    this.memory.set(id, newValue);
  }
}
