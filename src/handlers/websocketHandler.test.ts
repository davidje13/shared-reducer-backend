import type { Server } from 'http';
import context, { Spec } from 'json-immutability-helper';
import WebSocketExpress from 'websocket-express';
import request from 'superwstest';
import websocketHandler from './websocketHandler';
import InMemoryModel from '../model/InMemoryModel';
import { Broadcaster } from '../Broadcaster';
import ReadWrite from '../permission/ReadWrite';
import ReadOnly from '../permission/ReadOnly';
import ReadWriteStruct from '../permission/ReadWriteStruct';
import Sentinel from './test-helpers/Sentinel';
import { TestT, validateTestT } from './test-helpers/TestT';

describe('websocketHandler', () => {
  let app: WebSocketExpress;
  let server: Server;
  let model: InMemoryModel<TestT>;
  let broadcaster: Broadcaster<TestT, Spec<TestT>>;

  beforeEach((done) => {
    app = new WebSocketExpress();
    model = new InMemoryModel(validateTestT);
    broadcaster = Broadcaster.for(model)
      .withReducer<Spec<TestT>>(context)
      .build();
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
      .expectJson({ init: { foo: 'v1' } });
  });

  it('reflects changes', async () => {
    const handler = websocketHandler(broadcaster);
    app.ws('/:id', handler((req) => req.params.id, () => ReadWrite));

    await request(server)
      .ws('/a')
      .expectJson()
      .sendJson({ change: { foo: ['=', 'v2'] } })
      .expectJson({ change: { foo: ['=', 'v2'] } });
  });

  it('rejects changes in read-only mode', async () => {
    const handler = websocketHandler(broadcaster);
    app.ws('/:id', handler((req) => req.params.id, () => ReadOnly));

    await request(server)
      .ws('/a')
      .expectJson()
      .sendJson({ change: { foo: ['=', 'v2'] } })
      .expectJson({ error: 'Cannot modify data' });
  });

  it('rejects changes forbidden by permissions', async () => {
    const handler = websocketHandler(broadcaster);
    app.ws('/:id', handler((req) => req.params.id, () => new ReadWriteStruct(['foo'])));

    await request(server)
      .ws('/a')
      .expectJson()
      .sendJson({ change: { foo: ['=', 'v2'] } })
      .expectJson({ error: 'Cannot edit field foo' });
  });

  it('rejects changes forbidden by model', async () => {
    const handler = websocketHandler(broadcaster);
    app.ws('/:id', handler((req) => req.params.id, () => ReadWrite));

    await request(server)
      .ws('/a')
      .expectJson()
      .sendJson({ change: { foo: ['=', 'denied'] } })
      .expectJson({ error: 'Test rejection' });
  });

  it('reflects id field if provided', async () => {
    const handler = websocketHandler(broadcaster);
    app.ws('/:id', handler((req) => req.params.id, () => ReadWrite));

    await request(server)
      .ws('/a')
      .expectJson()
      .sendJson({ change: { foo: ['=', 'v2'] }, id: 20 })
      .expectJson({ change: { foo: ['=', 'v2'] }, id: 20 });
  });

  it('sends updates to other subscribers without id field', async () => {
    const handler = websocketHandler(broadcaster);
    app.ws('/:id', handler((req) => req.params.id, () => ReadWrite));

    const sentinel = new Sentinel();

    await Promise.all([
      request(server)
        .ws('/a')
        .expectJson({ init: { foo: 'v1' } })
        .exec(sentinel.await)
        .sendJson({ change: { foo: ['=', 'v2'] }, id: 20 })
        .expectJson({ change: { foo: ['=', 'v2'] }, id: 20 }),

      request(server)
        .ws('/a')
        .expectJson({ init: { foo: 'v1' } })
        .exec(sentinel.resolve)
        .expectJson({ change: { foo: ['=', 'v2'] } }),
    ]);

    await request(server)
      .ws('/a')
      .expectJson({ init: { foo: 'v2' } });
  });
});
