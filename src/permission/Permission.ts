import type { Spec } from 'json-immutability-helper';

export class PermissionError extends Error {
}

export default interface Permission<T> {
  validateWriteSpec?(spec: Spec<T>): void;

  validateWrite(newValue: T, oldValue: T): void;
}
