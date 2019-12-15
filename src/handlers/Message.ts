export default interface Message {
  change: Record<string, unknown>;
  id?: number;
}

function isObject(o: unknown): o is Record<string, unknown> {
  return typeof o === 'object' && Boolean(o);
}

export function validateMessage(rawData: unknown): Message {
  if (!isObject(rawData)) {
    throw new Error('Must specify change and optional id');
  }
  const { id, change } = rawData;
  if (!isObject(change) || Array.isArray(change)) {
    throw new Error('change must be a dictionary');
  }
  if (id !== undefined && typeof id !== 'number') {
    throw new Error('if specified, id must be a number');
  }
  return { change, id };
}

export function unpackMessage(msg: string): Message {
  // return json.parse(msg, json.object({
  //   change: json.record,
  //   id: json.optional(json.number),
  // }));

  return validateMessage(JSON.parse(msg));
}
