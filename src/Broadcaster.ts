import UniqueIdProvider from './helpers/UniqueIdProvider';
import TaskQueueMap from './task-queue/TaskQueueMap';
import type TopicMap from './topic/TopicMap';
import TrackingTopicMap from './topic/TrackingTopicMap';
import InMemoryTopic from './topic/InMemoryTopic';
import type Permission from './permission/Permission';
import ReadWrite from './permission/ReadWrite';
import type Model from './model/Model';

export interface Context<T, SpecT> {
  update: (input: T, spec: SpecT) => T;
}

export interface Subscription<T, SpecT, MetaT> {
  getInitialData: () => Readonly<T>;
  send: (change: SpecT, meta?: MetaT) => Promise<void>;
  close: () => Promise<void>;
}

type Identifier = string | null;

export type ChangeInfo<SpecT> = {
  change: SpecT;
  error?: undefined;
} | {
  change?: undefined;
  error: string;
};

export interface TopicMessage<SpecT> {
  message: ChangeInfo<SpecT>;
  source: Identifier;
  meta?: unknown;
}

interface BroadcasterBuilder<T, SpecT> {
  withReducer<SpecT2 extends SpecT>(
    context: Context<T, SpecT2>,
  ): BroadcasterBuilder<T, SpecT2>;

  withSubscribers(subscribers: TopicMap<TopicMessage<SpecT>>): this;

  withTaskQueues(taskQueues: TaskQueueMap<void>): this;

  withIdProvider(idProvider: UniqueIdProvider): this;

  build(): Broadcaster<T, SpecT>;
}

export class Broadcaster<T, SpecT> {
  private constructor(
    private readonly model: Model<T>,
    private readonly context: Context<T, SpecT>,
    private readonly subscribers: TopicMap<TopicMessage<SpecT>>,
    private readonly taskQueues: TaskQueueMap<void>,
    private readonly idProvider: UniqueIdProvider,
  ) {}

  public static for<T2>(model: Model<T2>): BroadcasterBuilder<T2, unknown> {
    let bContext: Context<T2, unknown>;
    let bSubscribers: TopicMap<TopicMessage<unknown>>;
    let bTaskQueues: TaskQueueMap<void>;
    let bIdProvider: UniqueIdProvider;

    // return types are defined in BroadcasterBuilder interface */
    /* eslint-disable @typescript-eslint/explicit-function-return-type */
    const builder = {
      withReducer(context: Context<T2, unknown>) {
        bContext = context;
        return builder;
      },

      withSubscribers(subscribers: TopicMap<TopicMessage<unknown>>) {
        bSubscribers = subscribers;
        return builder;
      },

      withTaskQueues(taskQueues: TaskQueueMap<void>) {
        bTaskQueues = taskQueues;
        return builder;
      },

      withIdProvider(idProvider: UniqueIdProvider) {
        bIdProvider = idProvider;
        return builder;
      },

      build() {
        if (!bContext) {
          throw new Error('must set broadcaster context');
        }
        return new Broadcaster(
          model,
          bContext,
          bSubscribers || new TrackingTopicMap(() => new InMemoryTopic()),
          bTaskQueues || new TaskQueueMap<void>(),
          bIdProvider || new UniqueIdProvider(),
        );
      },
    };
    /* eslint-enable @typescript-eslint/explicit-function-return-type */
    return builder as BroadcasterBuilder<T2, unknown>;
  }

  public async subscribe<MetaT>(
    id: string,
    onChange: (message: ChangeInfo<SpecT>, meta: MetaT | undefined) => void,
    permission: Permission<T, SpecT> = ReadWrite,
  ): Promise<Subscription<T, SpecT, MetaT> | null> {
    let initialData = await this.model.read(id);
    if (initialData === null || initialData === undefined) {
      return null;
    }

    const myId = this.idProvider.get();
    const eventHandler = ({ message, source, meta }: TopicMessage<SpecT>): void => {
      if (source === myId) {
        onChange(message, meta as MetaT);
      } else if (message.change) {
        onChange(message, undefined);
      }
    };

    this.subscribers.add(id, eventHandler);

    return {
      getInitialData: (): Readonly<T> => {
        if (initialData === null) {
          throw new Error('Already fetched initialData');
        }
        const data = initialData!;
        initialData = null; // GC
        return data;
      },
      send: (
        change: SpecT,
        meta?: MetaT,
      ): Promise<void> => this.internalQueueChange(id, change, permission, myId, meta),
      close: async (): Promise<void> => {
        await this.subscribers.remove(id, eventHandler);
      },
    };
  }

  public update(
    id: string,
    change: SpecT,
    permission: Permission<T, SpecT> = ReadWrite,
  ): Promise<void> {
    return this.internalQueueChange(id, change, permission, null, undefined);
  }

  private async internalApplyChange(
    id: string,
    change: SpecT,
    permission: Permission<T, SpecT>,
    source: Identifier,
    meta: unknown,
  ): Promise<void> {
    try {
      const original = await this.model.read(id);
      if (!original) {
        throw new Error('Deleted');
      }
      permission.validateWriteSpec?.(change);
      const updated = this.context.update(original, change);
      const validatedUpdate = this.model.validate(updated);
      permission.validateWrite(validatedUpdate, original);

      await this.model.write(id, validatedUpdate, original);
    } catch (e: unknown) {
      this.subscribers.broadcast(id, {
        message: { error: (e instanceof Error) ? e.message : 'Internal error' },
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
    change: SpecT,
    permission: Permission<T, SpecT>,
    source: Identifier,
    meta: unknown,
  ): Promise<void> {
    return this.taskQueues.push(
      id,
      () => this.internalApplyChange(id, change, permission, source, meta),
    );
  }
}
