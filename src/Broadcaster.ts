import { update, Spec } from 'json-immutability-helper';
import UniqueIdProvider from './helpers/UniqueIdProvider';
import TaskQueueMap from './task-queue/TaskQueueMap';
import type TopicMap from './topic/TopicMap';
import TrackingTopicMap from './topic/TrackingTopicMap';
import InMemoryTopic from './topic/InMemoryTopic';
import type Permission from './permission/Permission';
import ReadWrite from './permission/ReadWrite';
import type Model from './model/Model';

export interface Subscription<T, MetaT> {
  getInitialData: () => Readonly<T>;
  send: (change: Spec<T>, meta?: MetaT) => Promise<void>;
  close: () => Promise<void>;
}

type Identifier = string | null;

export type ChangeInfo<T> = {
  change: Spec<T>;
  error?: undefined;
} | {
  change?: undefined;
  error: string;
};

export interface TopicMessage<T> {
  message: ChangeInfo<T>;
  source: Identifier;
  meta?: unknown;
}

export class Broadcaster<T> {
  constructor(
    private readonly model: Model<T>,
    private readonly subscribers: TopicMap<TopicMessage<T>>
    = new TrackingTopicMap(() => new InMemoryTopic()),
    private readonly taskQueues = new TaskQueueMap<void>(),
    private readonly idProvider = new UniqueIdProvider(),
  ) {}

  public async subscribe<MetaT>(
    id: string,
    onChange: (message: ChangeInfo<T>, meta: MetaT | undefined) => void,
    permission: Permission<T> = ReadWrite,
  ): Promise<Subscription<T, MetaT> | null> {
    let initialData = await this.model.read(id);
    if (!initialData) {
      return null;
    }

    const myId = this.idProvider.get();
    const eventHandler = ({ message, source, meta }: TopicMessage<T>): void => {
      if (source === myId) {
        onChange(message, meta as MetaT);
      } else if (message.change) {
        onChange(message, undefined);
      }
    };

    this.subscribers.add(id, eventHandler);

    return {
      getInitialData: (): Readonly<T> => {
        if (!initialData) {
          throw new Error('Already fetched initialData');
        }
        const data = initialData;
        initialData = null; // GC
        return data;
      },
      send: (
        change: Spec<T>,
        meta?: MetaT,
      ): Promise<void> => this.internalQueueChange(id, change, permission, myId, meta),
      close: async (): Promise<void> => {
        await this.subscribers.remove(id, eventHandler);
      },
    };
  }

  public update(
    id: string,
    change: Spec<T>,
    permission: Permission<T> = ReadWrite,
  ): Promise<void> {
    return this.internalQueueChange(id, change, permission, null, undefined);
  }

  private async internalApplyChange(
    id: string,
    change: Spec<T>,
    permission: Permission<T>,
    source: Identifier,
    meta: unknown,
  ): Promise<void> {
    const original = await this.model.read(id);
    try {
      if (!original) {
        throw new Error('Deleted');
      }
      if (permission.validateWriteSpec) {
        permission.validateWriteSpec(change);
      }
      const updated = update(original, change);
      const validatedUpdate = this.model.validate(updated);
      permission.validateWrite(validatedUpdate, original);

      await this.model.write(id, validatedUpdate, original);
    } catch (e) {
      this.subscribers.broadcast(id, {
        message: { error: e.message },
        source,
        meta,
      });
      return;
    }

    this.subscribers.broadcast(id, {
      message: { change },
      source,
      meta,
    });
  }

  private async internalQueueChange(
    id: string,
    change: Spec<T>,
    permission: Permission<T>,
    source: Identifier,
    meta: unknown,
  ): Promise<void> {
    return this.taskQueues.push(
      id,
      () => this.internalApplyChange(id, change, permission, source, meta),
    );
  }
}
