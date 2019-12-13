# Shared Reducer Backend

Shared state management via websockets.

## Install dependency

```bash
npm install --save git+https://github.com/davidje13/shared-reducer-backend.git#semver:^1.1.1
```

## Usage

This project is compatible with
[websocket-express](https://github.com/davidje13/websocket-express),
but can also be used in isolation.

### With websocket-express

```js
import {
  Broadcaster,
  websocketHandler,
  InMemoryModel,
  ReadWrite,
} from 'shared-reducer-backend';
import WebSocketExpress from 'websocket-express';

const model = new InMemoryModel();
const broadcaster = new Broadcaster(model);
model.set('a', { foo: 'v1' });

const app = new WebSocketExpress();
const server = app.listen(0, 'localhost');

const handler = websocketHandler(broadcaster);
app.ws('/:id', handler((req) => req.params.id, () => ReadWrite));
```

For real use-cases, you will probably want to add authentication middleware
to the expressjs chain, and you may want to give some users read-only and
others read-write access, which can be achieved in the second lambda.

### Alone

```js
import {
  Broadcaster,
  websocketHandler,
  InMemoryModel,
  ReadWrite,
} from 'shared-reducer-backend';

const model = new InMemoryModel();
const broadcaster = new Broadcaster(model);
model.set('a', { foo: 'v1' });

// ...

const subscription = await broadcaster.subscribe(
  'a',
  (change, meta) => { /*...*/ },
);

const begin = subscription.getInitialData();
await subscription.send({ $set: { foo: 'v2' } });
// callback provided earlier is invoked

await subscription.close();
```

## Persisting data

A convenience wrapper is provided for use with
[collection-storage](https://github.com/davidje13/collection-storage),
or you can write your own implementation of the `Model` interface to
link any backend.

```js
import {
  Broadcaster,
  CollectionStorageModel,
} from 'shared-reducer-backend';
import CollectionStorage from 'collection-storage';

const db = await CollectionStorage.connect('memory://something');
const model = new CollectionStorageModel(
  db.getCollection('foo'),
  'id',
  // a function which takes in an object and returns it if valid,
  // or throws if invalid (protects stored data from malicious changes)
  MY_VALIDATOR,
);
const broadcaster = new Broadcaster(model);
```

Note that the provided validator MUST verify structural integrity (e.g.
ensuring no unexpected fields are added or types are changed).

## WebSocket protocol

The websocket protocol is minimal:

### Messages received

`P` (ping):
Can be sent periodically to keep the connection alive. Sends a "Pong" message
in response immediately.

`{"change": <spec>, "id": <id>}`:
Defines a delta. The ID will be reflected back once the change has been
applied. Other clients will not receive the ID.

### Messages sent

`p` (pong):
Reponse to a ping. May also be sent unsolicited.

`{"change": {$set: <state>}}`:
The first message sent by the server, in response to a successful
connection.

`{"change": <spec>}`:
Sent whenever another client has changed the server state.

`{"change": <spec>, "id": <id>}`:
Sent whenever the current client has changed the server state. Note that
the spec and ID will match the client-sent values.

`{"error": <message>, "id": <id>}`:
Sent if the server rejects a client-initiated change.

If this is returned, the server state will not have changed (i.e. the
entire spec failed).
