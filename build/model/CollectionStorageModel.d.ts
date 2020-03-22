import type Model from './Model';
interface Collection<T extends object> {
    get<K extends keyof T & string>(searchAttribute: K, searchValue: T[K]): Promise<Readonly<T> | null>;
    update<K extends keyof T & string>(searchAttribute: K, searchValue: T[K], update: Partial<T>): Promise<void>;
}
export default class CollectionStorageModel<T extends object> implements Model<T> {
    private readonly collection;
    private readonly idCol;
    private readonly readErrorIntercept;
    private readonly writeErrorIntercept;
    readonly validate: (v: unknown) => T;
    constructor(collection: Collection<T>, idCol: keyof T & string, validator: (v: unknown) => T, readErrorIntercept?: (e: Error) => Error, writeErrorIntercept?: (e: Error) => Error);
    read(id: string): Promise<Readonly<T> | null>;
    write(id: string, newValue: T, oldValue: T): Promise<void>;
}
export {};
//# sourceMappingURL=CollectionStorageModel.d.ts.map