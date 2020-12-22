import CollectionStorage, { Collection } from 'collection-storage';
import CollectionStorageModel from './CollectionStorageModel';

interface TestT {
  id: string;
  foo: number;
}

function validator(x: unknown): TestT {
  const v = x as TestT;
  if (v.foo === -1) {
    throw new Error('rejected');
  }
  return v;
}

describe('CollectionStorageModel', () => {
  let collection: Collection<TestT>;
  let model: CollectionStorageModel<TestT>;

  beforeEach(async () => {
    const db = await CollectionStorage.connect('memory://');
    collection = db.getCollection('col');
    model = new CollectionStorageModel(collection, 'id', validator);

    await collection.add({ id: 'abc', foo: 6 });
  });

  describe('read', () => {
    it('returns data for the given key', async () => {
      const value = await model.read('abc');
      expect(value).toEqual({ id: 'abc', foo: 6 });
    });

    it('returns null for unknown keys', async () => {
      expect(await model.read('nope')).toEqual(null);
    });
  });

  describe('write', () => {
    it('replaces data', async () => {
      const old = await model.read('abc');
      await model.write('abc', { id: 'abc', foo: 2 }, old!);

      const value = await collection.get('id', 'abc');
      expect(value).toEqual({ id: 'abc', foo: 2 });
    });

    it('applies diff from old value', async () => {
      await model.write(
        'abc',
        { id: 'abc', foo: 2 },
        { id: 'abc', foo: 2 },
      );

      // foo should not change as no diff was found
      const value = await collection.get('id', 'abc');
      expect(value).toEqual({ id: 'abc', foo: 6 });
    });

    it('avoids prototype access', async () => {
      /* eslint-disable no-proto, @typescript-eslint/no-explicit-any */
      const spy = jest.spyOn(collection, 'update').mockResolvedValue();

      await model.write(
        'abc',
        JSON.parse('{"id":"x","foo":3,"__proto__":{"injected":"gotchya"}}'),
        { id: 'abc', foo: 2 },
      );

      expect(spy).toHaveBeenCalled();
      const diff = spy.mock.calls[0][2] as any;
      expect(diff.injected).toBeUndefined();
      expect(diff.__proto__.injected).toEqual('gotchya');
      /* eslint-enable no-proto, @typescript-eslint/no-explicit-any */
    });
  });
});
