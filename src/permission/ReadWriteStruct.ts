import Permission, { PermissionError } from './Permission';

export default class ReadWriteStruct<T> implements Permission<T, unknown> {
  constructor(
    private readonly readOnlyFields: (keyof T)[] = [],
  ) {}

  public validateWrite(newValue: T, oldValue: T): void {
    Object.keys(oldValue).forEach((k) => {
      const key = k as keyof T & string;

      if (!Object.prototype.hasOwnProperty.call(newValue, key)) {
        if (this.readOnlyFields.includes(key)) {
          throw new PermissionError(`Cannot remove field ${key}`);
        }
      }
    });

    Object.keys(newValue).forEach((k) => {
      const key = k as keyof T & string;

      if (this.readOnlyFields.includes(key)) {
        if (!Object.prototype.hasOwnProperty.call(oldValue, key)) {
          throw new PermissionError(`Cannot add field ${key}`);
        }
        if (newValue[key] !== oldValue[key]) {
          throw new PermissionError(`Cannot edit field ${key}`);
        }
      }
    });
  }
}
