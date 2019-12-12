import { WSRequestHandler, WSResponse } from 'websocket-express';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Request } from 'express';
// eslint-disable-next-line import/no-unresolved
import { Params, ParamsDictionary } from 'express-serve-static-core';
import { Spec } from 'json-immutability-helper';
import Broadcaster, { ChangeInfo } from './Broadcaster';
import Permission, { PermissionError } from './permission/Permission';
import ReadOnly, { READ_ONLY_ERROR } from './permission/ReadOnly';

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
    if (permission === ReadOnly) {
      // this is validated properly later by the Broadcaster,
      // but we fail-fast here in this specific case.
      ws.send(JSON.stringify({ error: READ_ONLY_ERROR }));
      return;
    }

    const request = unpackMessage(msg);

    try {
      res.beginTransaction();
      subscription.send(request.change as Spec<T>, request.id);
    } catch (e) {
      if (e instanceof PermissionError) {
        res.sendError(403, 4403, e.message);
      } else {
        throw e;
      }
    } finally {
      res.endTransaction();
    }
  });

  ws.send(JSON.stringify({
    change: { $set: subscription.getInitialData() },
  }));
};

export default websocketHandler;
