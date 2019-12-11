import TopicMap from './TopicMap';
import Topic, { TopicListener } from './Topic';
export default class TrackingTopicMap<T> implements TopicMap<T> {
    private readonly topicFactory;
    private data;
    constructor(topicFactory: (key: string) => Topic<T>);
    add(key: string, fn: TopicListener<T>): Promise<void>;
    remove(key: string, fn: TopicListener<T>): Promise<void>;
    broadcast(key: string, message: T): Promise<void>;
}
//# sourceMappingURL=TrackingTopicMap.d.ts.map