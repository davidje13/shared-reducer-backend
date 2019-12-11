import TrackingTopicMap from './TrackingTopicMap';
import InMemoryTopic from './InMemoryTopic';

describe('TrackingTopicMap', () => {
  let factory: jest.Mock<InMemoryTopic<number>, [string]>;
  let provider: TrackingTopicMap<number>;

  beforeEach(() => {
    factory = jest.fn<InMemoryTopic<number>, [string]>(() => new InMemoryTopic<number>());
    provider = new TrackingTopicMap(factory);
  });

  describe('add', () => {
    it('uses the provided factory to create new topics as required', async () => {
      const listener = jest.fn<void, [number]>();

      await provider.add('key-1', listener);
      expect(factory).toHaveBeenCalledWith('key-1');
    });

    it('reuses existing topics where available', async () => {
      await provider.add('key-1', jest.fn<void, [number]>());
      await provider.add('key-1', jest.fn<void, [number]>());

      expect(factory).toHaveBeenCalledTimes(1);
    });

    it('registers listeners with the topic', async () => {
      const topic = new InMemoryTopic<number>();
      provider = new TrackingTopicMap(() => topic);

      const listener1 = jest.fn<void, [number]>();
      const listener2 = jest.fn<void, [number]>();

      await provider.add('key-1', listener1);
      await provider.add('key-1', listener2);

      topic.broadcast(1);
      expect(listener1).toHaveBeenCalledWith(1);
      expect(listener2).toHaveBeenCalledWith(1);
    });

    it('creates one topic per key', async () => {
      const listener = jest.fn<void, [number]>();

      await provider.add('key-1', listener);
      await provider.add('key-2', listener);

      expect(factory).toHaveBeenCalledWith('key-1');
      expect(factory).toHaveBeenCalledWith('key-2');
    });
  });

  describe('remove', () => {
    it('removes the given listener', async () => {
      const topic = new InMemoryTopic<number>();
      provider = new TrackingTopicMap(() => topic);

      const listener1 = jest.fn<void, [number]>();
      const listener2 = jest.fn<void, [number]>();

      await provider.add('key-1', listener1);
      await provider.add('key-1', listener2);
      topic.broadcast(1);
      expect(listener1).toHaveBeenCalledWith(1);
      expect(listener2).toHaveBeenCalledWith(1);

      await provider.remove('key-1', listener1);
      topic.broadcast(2);
      expect(listener1).not.toHaveBeenCalledWith(2);
      expect(listener2).toHaveBeenCalledWith(2);
    });

    it('clears the topic once all listeners are removed', async () => {
      const listener = jest.fn<void, [number]>();

      await provider.add('key-1', listener);
      await provider.remove('key-1', listener);

      await provider.add('key-1', listener);
      expect(factory).toHaveBeenCalledTimes(2);
    });

    it('ignores requests to remove from unknown topics', async () => {
      const listener = jest.fn<void, [number]>();

      await provider.remove('key-1', listener);
      expect(factory).not.toHaveBeenCalled();
    });
  });

  describe('broadcast', () => {
    it('delegates to the requested topic', async () => {
      const listener1 = jest.fn<void, [number]>();
      const listener2 = jest.fn<void, [number]>();
      await provider.add('key-1', listener1);
      await provider.add('key-2', listener2);

      await provider.broadcast('key-1', 1);

      expect(listener1).toHaveBeenCalledWith(1);
      expect(listener2).not.toHaveBeenCalled();
    });

    it('ignores requests to broadcast for unknown topics', async () => {
      await provider.broadcast('key-1', 1);
      expect(factory).not.toHaveBeenCalled();
    });
  });
});
