import type Permission from './Permission';

const ReadWrite: Permission<unknown> = {
  validateWrite(): void {
    // nothing to do
  },
};

export default ReadWrite;
