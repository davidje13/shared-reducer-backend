export default interface Model<T> {
    validate(v: unknown): Readonly<T>;
    read(id: string): Promise<Readonly<T> | null | undefined> | Readonly<T> | null | undefined;
    write(id: string, newValue: T, oldValue: T): Promise<void> | void;
}
//# sourceMappingURL=Model.d.ts.map