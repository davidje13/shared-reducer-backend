/// <reference types="node" />
import { EventEmitter } from 'events';
import type { Task, TaskQueue } from './TaskQueue';
export default class AsyncTaskQueue<T> extends EventEmitter implements TaskQueue<T> {
    private queue;
    private running;
    push(task: Task<T>): Promise<T>;
    private internalConsumeQueue;
}
//# sourceMappingURL=AsyncTaskQueue.d.ts.map