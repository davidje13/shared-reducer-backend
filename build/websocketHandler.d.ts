import type { WSRequestHandler, WSResponse } from 'websocket-express';
import type { Request } from 'express';
import type { Params, ParamsDictionary } from 'express-serve-static-core';
import type { Broadcaster } from './Broadcaster';
import type Permission from './permission/Permission';
export declare const PING = "P";
export declare const PONG = "p";
declare type DataExtractor<T, P extends Params = ParamsDictionary> = (req: Request<P>, res: WSResponse) => Promise<T> | T;
declare const websocketHandler: <T>(broadcaster: Broadcaster<T>) => <P extends Params = ParamsDictionary>(idGetter: DataExtractor<string, P>, permissionGetter: DataExtractor<Permission<T>, P>) => WSRequestHandler<P>;
export default websocketHandler;
//# sourceMappingURL=websocketHandler.d.ts.map