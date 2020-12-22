import Permission, { PermissionError } from './Permission';

export const READ_ONLY_ERROR = 'Cannot modify data';

const ReadOnly: Permission<unknown, unknown> = {
  validateWriteSpec(): void {
    throw new PermissionError(READ_ONLY_ERROR);
  },

  validateWrite(): void {
    throw new PermissionError(READ_ONLY_ERROR);
  },
};

export default ReadOnly;
