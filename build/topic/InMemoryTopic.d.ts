import Topic, { TopicListener } from './Topic';
export default class InMemoryTopic<T> implements Topic<T> {
    private subscribers;
    add(fn: TopicListener<T>): void;
    remove(fn: TopicListener<T>): boolean;
    broadcast(message: T): void;
}
//# sourceMappingURL=InMemoryTopic.d.ts.map