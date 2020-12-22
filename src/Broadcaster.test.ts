import context, { Spec } from 'json-immutability-helper';
import { Broadcaster, ChangeInfo, Subscription } from './Broadcaster';
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

type ChangeParams = [ChangeInfo<Spec<TestT>>, number?];

describe('Broadcaster', () => {
  let model: InMemoryModel<TestT>;
  let broadcaster: Broadcaster<TestT, Spec<TestT>>;

  beforeEach(() => {
    model = new InMemoryModel(validateTestT);
    broadcaster = Broadcaster.for(model)
      .withReducer<Spec<TestT>>(context)
      .build();
  });

  async function subscribe<MetaT>(
    id: string,
    onChange: (message: ChangeInfo<Spec<TestT>>, meta?: MetaT) => void,
  ): Promise<Subscription<TestT, Spec<TestT>, MetaT>> {
    const subscription = await broadcaster.subscribe(id, onChange);
    if (!subscription) {
      throw new Error('Failed to subscribe');
    }
    return subscription;
  }

  it('notifies subscribers of updates', async () => {
    const changeListener = jest.fn<void, ChangeParams>();

    model.set('a', { foo: 'v1' });
    const subscription = await subscribe('a', changeListener);

    await broadcaster.update('a', { foo: ['=', 'v2'] });

    expect(changeListener).toHaveBeenCalledWith(
      { change: { foo: ['=', 'v2'] } },
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
    await broadcaster.update('a', { foo: ['=', 'v2'] });

    expect(model.get('a')).toEqual({ foo: 'v2' });
  });

  it('provides an initial state to new subscribers', async () => {
    const changeListener = jest.fn<void, ChangeParams>();

    model.set('a', { foo: 'v1' });
    const subscription = await subscribe('a', changeListener);

    expect(subscription.getInitialData()).toEqual({ foo: 'v1' });

    // subsequent requests fail to allow GC cleanup
    expect(() => subscription.getInitialData()).toThrow();

    await subscription.close();
  });

  it('shares changes between clients (but not metadata)', async () => {
    model.set('a', { foo: 'v1' });

    const changeListener1 = jest.fn<void, ChangeParams>();
    const subscription1 = await subscribe('a', changeListener1);

    const changeListener2 = jest.fn<void, ChangeParams>();
    const subscription2 = await subscribe('a', changeListener2);

    await subscription1.send({ foo: ['=', 'v2'] }, 20);

    expect(changeListener1).toHaveBeenCalledWith(
      { change: { foo: ['=', 'v2'] } },
      20,
    );
    expect(changeListener2).toHaveBeenCalledWith(
      { change: { foo: ['=', 'v2'] } },
      undefined,
    );

    await subscription1.close();
    await subscription2.close();
  });

  it('stops sending changes when the subscription is closed', async () => {
    model.set('a', { foo: 'v1' });

    const changeListener1 = jest.fn<void, ChangeParams>();
    const subscription1 = await subscribe('a', changeListener1);

    const changeListener2 = jest.fn<void, ChangeParams>();
    const subscription2 = await subscribe('a', changeListener2);

    await subscription1.close();

    await subscription2.send({ foo: ['=', 'v2'] }, 20);
    expect(changeListener1).not.toHaveBeenCalled();
    expect(changeListener2).toHaveBeenCalled();

    await subscription2.close();
  });

  it('rejects invalid changes and does not notify others', async () => {
    model.set('a', { foo: 'v1' });

    const changeListener1 = jest.fn<void, ChangeParams>();
    const subscription1 = await subscribe('a', changeListener1);

    const changeListener2 = jest.fn<void, ChangeParams>();
    const subscription2 = await subscribe('a', changeListener2);

    const invalidType = 'eek' as unknown as TestT;
    await subscription1.send(['=', invalidType], 20);

    expect(changeListener1).toHaveBeenCalledWith(
      { error: 'should be an object' },
      20,
    );
    expect(changeListener2).not.toHaveBeenCalled();

    await subscription1.close();
    await subscription2.close();
  });
});
