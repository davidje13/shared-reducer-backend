import { TaskQueue, Task } from './TaskQueue';
export default class TaskQueueMap<T> {
    private readonly queueFactory;
    private readonly queues;
    constructor(queueFactory?: () => TaskQueue<T>);
    push(key: string, task: Task<T>): Promise<T>;
}
//# sourceMappingURL=TaskQueueMap.d.ts.map