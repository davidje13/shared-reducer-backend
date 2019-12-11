import Permission, { PermissionError } from './Permission';

export const READ_ONLY_ERROR = 'Cannot modify data';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReadOnly: Permission<any> = {
  validateWriteSpec(): void {
    throw new PermissionError(READ_ONLY_ERROR);
  },

  validateWrite(): void {
    throw new PermissionError(READ_ONLY_ERROR);
  },
};

export default ReadOnly;
