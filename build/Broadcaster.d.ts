import { Spec } from 'json-immutability-helper';
import UniqueIdProvider from './helpers/UniqueIdProvider';
import TaskQueueMap from './task-queue/TaskQueueMap';
import TopicMap from './topic/TopicMap';
import Permission from './permission/Permission';
import Model from './model/Model';
export interface Subscription<T, MetaT> {
    getInitialData: () => Readonly<T>;
    send: (change: Spec<T>, meta?: MetaT) => Promise<void>;
    close: () => Promise<void>;
}
declare type Identifier = string | null;
export declare type ChangeInfo<T> = {
    change: Spec<T>;
} | {
    change?: undefined;
    error: string;
};
export interface TopicMessage<T> {
    message: ChangeInfo<T>;
    source: Identifier;
    meta?: unknown;
}
export default class Broadcaster<T> {
    private readonly model;
    private readonly subscribers;
    private readonly taskQueues;
    private readonly idProvider;
    constructor(model: Model<T>, subscribers?: TopicMap<TopicMessage<T>>, taskQueues?: TaskQueueMap<void>, idProvider?: UniqueIdProvider);
    subscribe<MetaT>(id: string, onChange: (message: ChangeInfo<T>, meta: MetaT | undefined) => void, permission?: Permission<T>): Promise<Subscription<T, MetaT> | null>;
    update(id: string, change: Spec<T>, permission?: Permission<T>): Promise<void>;
    private internalApplyChange;
    private internalQueueChange;
}
export {};
//# sourceMappingURL=Broadcaster.d.ts.map