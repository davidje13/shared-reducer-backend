import Permission, { PermissionError } from './Permission';

export default class ReadWriteStruct<T extends object> implements Permission<T> {
  constructor(
    private readonly readOnlyFields: (keyof T)[] = [],
  ) {}

  public validateWrite(newValue: T, oldValue: T): void {
    Object.keys(oldValue).forEach((k) => {
      if (!Object.prototype.hasOwnProperty.call(newValue, k)) {
        throw new Error(`Cannot remove field ${k}`);
      }
    });

    Object.keys(newValue).forEach((k) => {
      if (!Object.prototype.hasOwnProperty.call(oldValue, k)) {
        throw new Error(`Cannot add field ${k}`);
      }
      const key = k as keyof T & string;
      if (this.readOnlyFields.includes(key)) {
        if (newValue[key] !== oldValue[key]) {
          throw new PermissionError(`Cannot edit field ${k}`);
        }
      }
    });
  }
}
