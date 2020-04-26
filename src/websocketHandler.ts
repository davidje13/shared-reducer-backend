import type { WSRequestHandler, WSResponse } from 'websocket-express';
import type { Request } from 'express';
// eslint-disable-next-line import/no-unresolved
import type { Params, ParamsDictionary } from 'express-serve-static-core';
import type { Spec } from 'json-immutability-helper';
import type { Broadcaster, ChangeInfo } from './Broadcaster';
import type Permission from './permission/Permission';

export const PING = 'P';
export const PONG = 'p';

type DataExtractor<T, P extends Params = ParamsDictionary> = (
  req: Request<P>,
  res: WSResponse,
) => Promise<T> | T;

interface Message {
  change: Record<string, unknown>;
  id?: number;
}

function unpackMessage(msg: string): Message {
  // return json.parse(msg, json.object({
  //   change: json.record,
  //   id: json.optional(json.number),
  // }));

  const rawData = JSON.parse(msg);
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('Must specify change and optional id');
  }
  const { id, change } = rawData;
  if (!change || typeof change !== 'object' || Array.isArray(change)) {
    throw new Error('change must be a dictionary');
  }
  if (id !== undefined && typeof id !== 'number') {
    throw new Error('if specified, id must be a number');
  }
  return { change, id };
}

const websocketHandler = <T>(
  broadcaster: Broadcaster<T>,
) => <P extends Params = ParamsDictionary>(
  idGetter: DataExtractor<string, P>,
  permissionGetter: DataExtractor<Permission<T>, P>,
): WSRequestHandler<P> => async (req, res): Promise<void> => {
  const ws = await res.accept();

  const onChange = (msg: ChangeInfo<T>, id?: number): void => {
    const data = (id !== undefined) ? { id, ...msg } : msg;
    ws.send(JSON.stringify(data));
  };

  const id = await idGetter(req, res);
  const permission = await permissionGetter(req, res);
  const subscription = await broadcaster.subscribe(id, onChange, permission);

  if (!subscription) {
    res.sendError(404);
    return;
  }

  ws.on('close', subscription.close);

  ws.on('message', (msg: string) => {
    if (msg === PING) {
      ws.send(PONG);
      return;
    }

    const request = unpackMessage(msg);

    try {
      res.beginTransaction();
      subscription.send(request.change as Spec<T>, request.id);
    } finally {
      res.endTransaction();
    }
  });

  ws.send(JSON.stringify({
    change: ['=', subscription.getInitialData()],
  }));
};

export default websocketHandler;
