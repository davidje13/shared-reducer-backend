import InMemoryModel from './InMemoryModel';

describe('InMemoryModel', () => {
  it('stores and retrieves data', async () => {
    const data = new InMemoryModel<number>();

    data.set('a', 1);
    expect(data.get('a')).toEqual(1);
  });

  it('separates data by key', async () => {
    const data = new InMemoryModel<number>();

    data.set('a', 1);
    data.set('b', 2);
    expect(data.get('a')).toEqual(1);
    expect(data.get('b')).toEqual(2);
  });

  describe('read', () => {
    it('returns data for the given key', () => {
      const data = new InMemoryModel<number>();

      data.set('a', 1);
      expect(data.read('a')).toEqual(1);
    });

    it('returns undefined for unknown keys', () => {
      const data = new InMemoryModel<number>();

      expect(data.read('a')).toEqual(undefined);
    });
  });

  describe('write', () => {
    it('replaces data', () => {
      const data = new InMemoryModel<number>();

      data.set('a', 1);
      data.write('a', 2, 1);
      expect(data.get('a')).toEqual(2);
    });

    it('rejects changes if the old value is incorrect', () => {
      const data = new InMemoryModel<number>();

      data.set('a', 1);
      expect(() => data.write('a', 2, 3)).toThrow('Unexpected previous value');
    });
  });

  describe('delete', () => {
    it('removes data for the requested key', () => {
      const data = new InMemoryModel<number>();

      data.set('a', 1);
      data.set('b', 2);
      data.delete('a');
      expect(data.read('a')).toEqual(undefined);
      expect(data.read('b')).toEqual(2);
    });
  });
});
