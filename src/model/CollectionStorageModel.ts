import type Model from './Model';

// type matches collection-storage
interface Collection<T> {
  get<K extends keyof T & string>(
    searchAttribute: K,
    searchValue: T[K],
  ): Promise<Readonly<T> | null>;

  update<K extends keyof T & string>(
    searchAttribute: K,
    searchValue: T[K],
    update: Partial<T>,
  ): Promise<void>;
}

const ERROR_NOP = (e: Error): Error => e;

export default class CollectionStorageModel<T> implements Model<T> {
  public readonly validate: (v: unknown) => T;

  constructor(
    private readonly collection: Collection<T>,
    private readonly idCol: keyof T & string,
    validator: (v: unknown) => T,
    private readonly readErrorIntercept = ERROR_NOP,
    private readonly writeErrorIntercept = ERROR_NOP,
  ) {
    this.validate = validator;
  }

  public async read(id: string): Promise<Readonly<T> | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await this.collection.get(this.idCol, id as any);
    } catch (e: unknown) {
      throw this.readErrorIntercept(e as Error);
    }
  }

  public async write(id: string, newValue: T, oldValue: T): Promise<void> {
    const diff: Partial<T> = {};
    Object.entries(newValue).forEach(([k, value]) => {
      const key = k as keyof T & string;
      const old = Object.prototype.hasOwnProperty.call(oldValue, key) ? oldValue[key] : undefined;
      if (value !== old) {
        if (diff[key]) {
          Object.defineProperty(diff, key, {
            value,
            configurable: true,
            enumerable: true,
            writable: true,
          });
        } else {
          diff[key] = value;
        }
      }
    });

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.collection.update(this.idCol, id as any, diff);
    } catch (e: unknown) {
      throw this.writeErrorIntercept(e as Error);
    }
  }
}
