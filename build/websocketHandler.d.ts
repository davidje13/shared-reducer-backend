import { WSRequestHandler, WSResponse } from 'websocket-express';
import { Request } from 'express';
import { Params, ParamsDictionary } from 'express-serve-static-core';
import Broadcaster from './Broadcaster';
import Permission from './permission/Permission';
export declare const PING = "P";
export declare const PONG = "p";
declare type DataExtractor<T, P extends Params = ParamsDictionary> = (req: Request<P>, res: WSResponse) => Promise<T> | T;
declare const websocketHandler: <T>(broadcaster: Broadcaster<T>) => <P extends Params = ParamsDictionary>(idGetter: DataExtractor<string, P>, permissionGetter: DataExtractor<Permission<T>, P>) => WSRequestHandler<P>;
export default websocketHandler;
//# sourceMappingURL=websocketHandler.d.ts.map