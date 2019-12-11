import Broadcaster, { Subscription as ISubscription, ChangeInfo as IChangeInfo, TopicMessage as ITopicMessage } from './Broadcaster';
import websocketHandler, { PING, PONG } from './websocketHandler';
import UniqueIdProvider from './helpers/UniqueIdProvider';
import CollectionStorageModel from './model/CollectionStorageModel';
import IModel from './model/Model';
import IPermission, { PermissionError } from './permission/Permission';
import InMemoryModel from './model/InMemoryModel';
import ReadOnly from './permission/ReadOnly';
import ReadWrite from './permission/ReadWrite';
import ReadWriteStruct from './permission/ReadWriteStruct';
import AsyncTaskQueue from './task-queue/AsyncTaskQueue';
import { Task as ITask, TaskQueue as ITaskQueue, TaskQueueFactory as ITaskQueueFactory } from './task-queue/TaskQueue';
import TaskQueueMap from './task-queue/TaskQueueMap';
import ITopic from './topic/Topic';
import ITopicMap from './topic/TopicMap';
import InMemoryTopic from './topic/InMemoryTopic';
import TrackingTopicMap from './topic/TrackingTopicMap';
export declare type Subscription<T, MetaT> = ISubscription<T, MetaT>;
export declare type ChangeInfo<T> = IChangeInfo<T>;
export declare type TopicMessage<T> = ITopicMessage<T>;
export declare type Model<T> = IModel<T>;
export declare type Permission<T> = IPermission<T>;
export declare type Task<T> = ITask<T>;
export declare type TaskQueue<T> = ITaskQueue<T>;
export declare type TaskQueueFactory<T> = ITaskQueueFactory<T>;
export declare type Topic<T> = ITopic<T>;
export declare type TopicMap<T> = ITopicMap<T>;
export { Broadcaster, websocketHandler, PING, PONG, InMemoryModel, CollectionStorageModel, PermissionError, ReadOnly, ReadWrite, ReadWriteStruct, AsyncTaskQueue, TaskQueueMap, InMemoryTopic, TrackingTopicMap, UniqueIdProvider, };
//# sourceMappingURL=index.d.ts.map