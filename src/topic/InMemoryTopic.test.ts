import InMemoryTopic from './InMemoryTopic';

describe('InMemoryTopic', () => {
  let topic: InMemoryTopic<number>;

  beforeEach(() => {
    topic = new InMemoryTopic<number>();
  });

  describe('broadcast', () => {
    it('broadcasts messages to current subscribers', () => {
      const listener = jest.fn<void, [number]>();
      topic.add(listener);
      topic.broadcast(1);

      expect(listener).toHaveBeenCalledWith(1);
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('stops the listener receiving future broadcasts', () => {
      const listener = jest.fn<void, [number]>();
      topic.add(listener);
      topic.remove(listener);
      topic.broadcast(1);

      expect(listener).not.toHaveBeenCalled();
    });

    it('returns true if any subscribers remain', () => {
      const listener1 = jest.fn<void, [number]>();
      const listener2 = jest.fn<void, [number]>();
      topic.add(listener1);
      topic.add(listener2);

      expect(topic.remove(listener1)).toEqual(true);
    });

    it('returns false if no subscribers remain', () => {
      const listener = jest.fn<void, [number]>();
      topic.add(listener);

      expect(topic.remove(listener)).toEqual(false);
    });
  });
});
