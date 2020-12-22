import UniqueIdProvider from './helpers/UniqueIdProvider';
import TaskQueueMap from './task-queue/TaskQueueMap';
import type TopicMap from './topic/TopicMap';
import type Permission from './permission/Permission';
import type Model from './model/Model';
export interface Context<T, SpecT> {
    update: (input: T, spec: SpecT) => T;
}
export interface Subscription<T, SpecT, MetaT> {
    getInitialData: () => Readonly<T>;
    send: (change: SpecT, meta?: MetaT) => Promise<void>;
    close: () => Promise<void>;
}
declare type Identifier = string | null;
export declare type ChangeInfo<SpecT> = {
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
    withReducer<SpecT2 extends SpecT>(context: Context<T, SpecT2>): BroadcasterBuilder<T, SpecT2>;
    withSubscribers(subscribers: TopicMap<TopicMessage<SpecT>>): this;
    withTaskQueues(taskQueues: TaskQueueMap<void>): this;
    withIdProvider(idProvider: UniqueIdProvider): this;
    build(): Broadcaster<T, SpecT>;
}
export declare class Broadcaster<T, SpecT> {
    private readonly model;
    private readonly context;
    private readonly subscribers;
    private readonly taskQueues;
    private readonly idProvider;
    private constructor();
    static for<T2>(model: Model<T2>): BroadcasterBuilder<T2, unknown>;
    subscribe<MetaT>(id: string, onChange: (message: ChangeInfo<SpecT>, meta: MetaT | undefined) => void, permission?: Permission<T, SpecT>): Promise<Subscription<T, SpecT, MetaT> | null>;
    update(id: string, change: SpecT, permission?: Permission<T, SpecT>): Promise<void>;
    private internalApplyChange;
    private internalQueueChange;
}
export {};
//# sourceMappingURL=Broadcaster.d.ts.map