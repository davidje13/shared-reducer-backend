import ReadWriteStruct from './ReadWriteStruct';

interface TestT {
  foo?: string;
  blocked?: string;
}

describe('ReadWriteStruct', () => {
  const permission = new ReadWriteStruct<TestT>(['blocked']);

  it('allows data changes', () => {
    const oldValue = { foo: 'a' };
    const newValue = { foo: 'b' };
    expect(() => permission.validateWrite(newValue, oldValue))
      .not.toThrow();
  });

  it('rejects additional fields', () => {
    const oldValue = { foo: 'a' };
    const newValue = { foo: 'a', bar: 'b' };
    expect(() => permission.validateWrite(newValue, oldValue))
      .toThrow('Cannot add field bar');
  });

  it('rejects removing fields', () => {
    const oldValue = { foo: 'a' };
    const newValue = { };
    expect(() => permission.validateWrite(newValue, oldValue))
      .toThrow('Cannot remove field foo');
  });

  it('rejects editing read-only fields', () => {
    const oldValue = { blocked: 'a' };
    const newValue = { blocked: 'b' };
    expect(() => permission.validateWrite(newValue, oldValue))
      .toThrow('Cannot edit field blocked');
  });

  it('allows changes which do no modify blocked fields', () => {
    const oldValue = { foo: 'a', blocked: 'a' };
    const newValue = { foo: 'b', blocked: 'a' };
    expect(() => permission.validateWrite(newValue, oldValue))
      .not.toThrow();
  });
});
