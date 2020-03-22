import type Permission from './Permission';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReadWrite: Permission<any> = {
  validateWrite(): void {
    // nothing to do
  },
};

export default ReadWrite;
