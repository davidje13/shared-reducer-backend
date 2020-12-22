import type { Request } from 'express';
import type { WSRequestHandler, WSResponse } from 'websocket-express';
import type { Broadcaster } from '../Broadcaster';
import type Permission from '../permission/Permission';
interface ParamsDictionary {
    [key: string]: string;
}
declare type ParamsArray = string[];
declare type Params = ParamsDictionary | ParamsArray;
export declare const PING = "P";
export declare const PONG = "p";
declare type DataExtractor<T, P extends Params = ParamsDictionary> = (req: Request<P>, res: WSResponse) => Promise<T> | T;
declare const websocketHandler: <T, SpecT>(broadcaster: Broadcaster<T, SpecT>) => <P extends Params = ParamsDictionary>(idGetter: DataExtractor<string, P>, permissionGetter: DataExtractor<Permission<T, SpecT>, P>) => WSRequestHandler<P>;
export default websocketHandler;
//# sourceMappingURL=websocketHandler.d.ts.map