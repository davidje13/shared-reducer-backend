import EventEmitter from 'events';
export declare type Task<T> = () => Promise<T>;
export interface TaskQueue<T> extends EventEmitter {
    push(task: Task<T>): Promise<T>;
}
export declare type TaskQueueFactory<T> = () => TaskQueue<T>;
//# sourceMappingURL=TaskQueue.d.ts.map