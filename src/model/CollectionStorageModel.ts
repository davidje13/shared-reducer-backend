import type Model from './Model';

// type matches collection-storage
interface Collection<T extends object> {
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

export default class CollectionStorageModel<T extends object> implements Model<T> {
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
    } catch (e) {
      throw this.readErrorIntercept(e);
    }
  }

  public async write(id: string, newValue: T, oldValue: T): Promise<void> {
    const diff: Partial<T> = {};
    Object.keys(newValue).forEach((k) => {
      const key = k as keyof T & string;
      if (newValue[key] !== oldValue[key]) {
        diff[key] = newValue[key];
      }
    });

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.collection.update(this.idCol, id as any, diff);
    } catch (e) {
      throw this.writeErrorIntercept(e);
    }
  }
}
