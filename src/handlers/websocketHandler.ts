import type { Request } from 'express';
import type { WSRequestHandler, WSResponse } from 'websocket-express';
import { unpackMessage } from './Message';
import type { Broadcaster, ChangeInfo } from '../Broadcaster';
import type Permission from '../permission/Permission';

interface ParamsDictionary { [key: string]: string }
type ParamsArray = string[];
type Params = ParamsDictionary | ParamsArray;

export const PING = 'P';
export const PONG = 'p';

type DataExtractor<T, P extends Params = ParamsDictionary> = (
  req: Request<P>,
  res: WSResponse,
) => Promise<T> | T;

const websocketHandler = <T, SpecT>(
  broadcaster: Broadcaster<T, SpecT>,
) => <P extends Params = ParamsDictionary>(
  idGetter: DataExtractor<string, P>,
  permissionGetter: DataExtractor<Permission<T, SpecT>, P>,
): WSRequestHandler<P> => async (req, res): Promise<void> => {
  const ws = await res.accept();

  const onChange = (msg: ChangeInfo<SpecT>, id?: number): void => {
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

  ws.on('message', (data: string | Buffer, isBinary?: boolean) => {
    if (isBinary) {
      return; // ignore
    }

    const msg = String(data);
    if (msg === PING) {
      ws.send(PONG);
      return;
    }

    const request = unpackMessage(msg);

    res.beginTransaction();
    subscription.send(request.change as SpecT, request.id)
      .finally(() => res.endTransaction());
  });

  ws.send(JSON.stringify({
    init: subscription.getInitialData(),
  }));
};

export default websocketHandler;
