export default interface Message {
    change: Record<string, unknown>;
    id?: number;
}
export declare function validateMessage(rawData: unknown): Message;
export declare function unpackMessage(msg: string): Message;
//# sourceMappingURL=Message.d.ts.map