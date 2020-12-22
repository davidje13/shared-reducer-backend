import type Permission from './Permission';

const ReadWrite: Permission<unknown, unknown> = {
  validateWrite(): void {
    // nothing to do
  },
};

export default ReadWrite;
