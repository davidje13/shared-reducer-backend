import { Spec } from 'json-immutability-helper';
import Broadcaster, { ChangeInfo } from './Broadcaster';
import InMemoryModel from './model/InMemoryModel';

interface TestT {
  foo: string;
}

function validateTestT(x: unknown): TestT {
  if (typeof x !== 'object' || !x) {
    throw new Error('should be an object');
  }
  if (Object.keys(x).length !== 1) {
    throw new Error('should have one property');
  }
  const test = x as TestT;
  if (typeof test.foo !== 'string') {
    throw new Error('should have foo');
  }
  return test;
}

type ChangeParams = [ChangeInfo<TestT>, number?];

describe('Broadcaster', () => {
  let model: InMemoryModel<TestT>;
  let broadcaster: Broadcaster<TestT>;

  beforeEach(() => {
    model = new InMemoryModel(validateTestT);
    broadcaster = new Broadcaster<TestT>(model);
  });

  it('notifies subscribers of updates', async () => {
    const changeListener = jest.fn<void, ChangeParams>();

    model.set('a', { foo: 'v1' });
    const subscription = await broadcaster.subscribe('a', changeListener);
    if (!subscription) {
      throw new Error('Failed to subscribe');
    }

    await broadcaster.update('a', { foo: { $set: 'v2' } });

    expect(changeListener).toHaveBeenCalledWith(
      { change: { foo: { $set: 'v2' } } },
      undefined,
    );

    await subscription.close();
  });

  it('rejects subscriptions to unknown keys', async () => {
    const subscription = await broadcaster.subscribe('nope', () => null);
    expect(subscription).toEqual(null);
  });

  it('persists changes to the backing storage', async () => {
    model.set('a', { foo: 'v1' });
    await broadcaster.update('a', { foo: { $set: 'v2' } });

    expect(model.get('a')).toEqual({ foo: 'v2' });
  });

  it('provides an initial state to new subscribers', async () => {
    const changeListener = jest.fn<void, ChangeParams>();

    model.set('a', { foo: 'v1' });
    const subscription = await broadcaster.subscribe('a', changeListener);
    if (!subscription) {
      throw new Error('Failed to subscribe');
    }

    expect(subscription.getInitialData()).toEqual({ foo: 'v1' });

    // subsequent requests fail to allow GC cleanup
    expect(() => subscription.getInitialData()).toThrow();

    await subscription.close();
  });

  it('shares changes between clients (but not metadata)', async () => {
    model.set('a', { foo: 'v1' });

    const changeListener1 = jest.fn<void, ChangeParams>();
    const subscription1 = await broadcaster.subscribe('a', changeListener1);
    if (!subscription1) {
      throw new Error('Failed to subscribe');
    }

    const changeListener2 = jest.fn<void, ChangeParams>();
    const subscription2 = await broadcaster.subscribe('a', changeListener2);
    if (!subscription2) {
      throw new Error('Failed to subscribe');
    }

    await subscription1.send({ foo: { $set: 'v2' } }, 20);

    expect(changeListener1).toHaveBeenCalledWith(
      { change: { foo: { $set: 'v2' } } },
      20,
    );
    expect(changeListener2).toHaveBeenCalledWith(
      { change: { foo: { $set: 'v2' } } },
      undefined,
    );

    await subscription1.close();
    await subscription2.close();
  });

  it('stops sending changes when the subscription is closed', async () => {
    model.set('a', { foo: 'v1' });

    const changeListener1 = jest.fn<void, ChangeParams>();
    const subscription1 = await broadcaster.subscribe('a', changeListener1);
    if (!subscription1) {
      throw new Error('Failed to subscribe');
    }

    const changeListener2 = jest.fn<void, ChangeParams>();
    const subscription2 = await broadcaster.subscribe('a', changeListener2);
    if (!subscription2) {
      throw new Error('Failed to subscribe');
    }

    await subscription1.close();

    await subscription2.send({ foo: { $set: 'v2' } }, 20);
    expect(changeListener1).not.toHaveBeenCalled();
    expect(changeListener2).toHaveBeenCalled();

    await subscription2.close();
  });

  it('rejects invalid changes and does not notify others', async () => {
    model.set('a', { foo: 'v1' });

    const changeListener1 = jest.fn<void, ChangeParams>();
    const subscription1 = await broadcaster.subscribe('a', changeListener1);
    if (!subscription1) {
      throw new Error('Failed to subscribe');
    }

    const changeListener2 = jest.fn<void, ChangeParams>();
    const subscription2 = await broadcaster.subscribe('a', changeListener2);
    if (!subscription2) {
      throw new Error('Failed to subscribe');
    }

    await subscription1.send({ $set: 'eek' } as Spec<TestT>, 20);

    expect(changeListener1).toHaveBeenCalledWith(
      { error: 'should be an object' },
      20,
    );
    expect(changeListener2).not.toHaveBeenCalled();

    await subscription1.close();
    await subscription2.close();
  });
});
