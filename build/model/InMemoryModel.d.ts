import type Model from './Model';
export default class InMemoryModel<T> implements Model<T> {
    readonly validate: (v: unknown) => T;
    private readonly memory;
    constructor(validator?: (x: unknown) => T);
    set(id: string, value: T): void;
    get(id: string): T | undefined;
    delete(id: string): void;
    read(id: string): Readonly<T> | null;
    write(id: string, newValue: T, oldValue: T): void;
}
//# sourceMappingURL=InMemoryModel.d.ts.map