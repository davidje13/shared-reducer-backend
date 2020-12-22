export declare class PermissionError extends Error {
}
export default interface Permission<T, SpecT> {
    validateWriteSpec?(spec: SpecT): void;
    validateWrite(newValue: T, oldValue: T): void;
}
//# sourceMappingURL=Permission.d.ts.map