import type Model from './Model';
export default class InMemoryModel<T> implements Model<T> {
    readonly read: (id: string) => Readonly<T> | undefined;
    readonly validate: (v: unknown) => T;
    private readonly memory;
    constructor(validator?: (x: unknown) => T);
    set(id: string, value: T): void;
    get(id: string): Readonly<T> | undefined;
    delete(id: string): void;
    write(id: string, newValue: T, oldValue: T): void;
}
//# sourceMappingURL=InMemoryModel.d.ts.map