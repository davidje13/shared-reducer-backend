import { Server } from 'http';
import WebSocketExpress from 'websocket-express';
import request from 'superwstest';
import websocketHandler from './websocketHandler';
import InMemoryModel from './model/InMemoryModel';
import Broadcaster from './Broadcaster';
import ReadWrite from './permission/ReadWrite';

interface TestT {
  foo: string;
}

class Sentinel {
  public readonly resolve: () => void;

  private readonly promise: Promise<void>;

  constructor() {
    let res: () => void;
    this.promise = new Promise((resolve) => {
      res = resolve;
    });
    this.resolve = res!;
  }

  public await = (): Promise<void> => this.promise;
}

describe('websocketHandler', () => {
  let app: WebSocketExpress;
  let server: Server;
  let model: InMemoryModel<TestT>;
  let broadcaster: Broadcaster<TestT>;

  beforeEach((done) => {
    app = new WebSocketExpress();
    model = new InMemoryModel();
    broadcaster = new Broadcaster<TestT>(model);
    server = app.listen(0, 'localhost', done);

    model.set('a', { foo: 'v1' });
  });

  afterEach((done) => {
    server.close(done);
  });

  it('creates a websocket-express compatible handler', async () => {
    const handler = websocketHandler(broadcaster);
    app.ws('/:id', handler((req) => req.params.id, () => ReadWrite));

    await request(server).ws('/a');
  });

  it('returns the initial state', async () => {
    const handler = websocketHandler(broadcaster);
    app.ws('/:id', handler((req) => req.params.id, () => ReadWrite));

    await request(server)
      .ws('/a')
      .expectJson({ change: { $set: { foo: 'v1' } } });
  });

  it('reflects changes', async () => {
    const handler = websocketHandler(broadcaster);
    app.ws('/:id', handler((req) => req.params.id, () => ReadWrite));

    await request(server)
      .ws('/a')
      .expectJson()
      .sendJson({ change: { foo: { $set: 'v2' } } })
      .expectJson({ change: { foo: { $set: 'v2' } } });
  });

  it('reflects id field if provided', async () => {
    const handler = websocketHandler(broadcaster);
    app.ws('/:id', handler((req) => req.params.id, () => ReadWrite));

    await request(server)
      .ws('/a')
      .expectJson()
      .sendJson({ change: { foo: { $set: 'v2' } }, id: 20 })
      .expectJson({ change: { foo: { $set: 'v2' } }, id: 20 });
  });

  it('sends updates to other subscribers without id field', async () => {
    const handler = websocketHandler(broadcaster);
    app.ws('/:id', handler((req) => req.params.id, () => ReadWrite));

    const sentinel = new Sentinel();

    await Promise.all([
      request(server)
        .ws('/a')
        .expectJson({ change: { $set: { foo: 'v1' } } })
        .exec(sentinel.await)
        .sendJson({ change: { foo: { $set: 'v2' } }, id: 20 })
        .expectJson({ change: { foo: { $set: 'v2' } }, id: 20 }),

      request(server)
        .ws('/a')
        .expectJson({ change: { $set: { foo: 'v1' } } })
        .exec(sentinel.resolve)
        .expectJson({ change: { foo: { $set: 'v2' } } }),
    ]);

    await request(server)
      .ws('/a')
      .expectJson({ change: { $set: { foo: 'v2' } } });
  });
});
