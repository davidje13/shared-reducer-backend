import Permission from './Permission';
export default class ReadWriteStruct<T> implements Permission<T> {
    private readonly readOnlyFields;
    constructor(readOnlyFields?: (keyof T)[]);
    validateWrite(newValue: T, oldValue: T): void;
}
//# sourceMappingURL=ReadWriteStruct.d.ts.map