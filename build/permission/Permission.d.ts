import { Spec } from 'json-immutability-helper';
export declare class PermissionError extends Error {
}
export default interface Permission<T> {
    validateWriteSpec?(spec: Spec<T>): void;
    validateWrite(newValue: T, oldValue: T): void;
}
//# sourceMappingURL=Permission.d.ts.map