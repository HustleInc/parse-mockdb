### Problem

The `afterSave` hook in **Parse MockDB** behaves differently to a
real Parse Server (v4.4.0 at time of writing).

In a real server, the `afterSave` hook will provide the original object
from before the save as `request.original`, as well as the saved object
in `request.object` as expected. In other words, it should provide the
same objects on the `request` object as you would see in `beforeSave`.

Thus, any cloud code which relies on using this information to perform
certain actions when particular data has changed isn't able to be unit
tested via Parse MockDB.

### Testing

- Cloud Code is here: [`main.js`](./main.js)
- Client-side simulation script is here: [`test_context.js`](./test_context.js)

The cloud code just logs out the `request.original` and `request.object`
in the `beforeSave` hook and the `afterSave` hook.

The test script just creates an object and then updates it.

Run the test Parse Server via Docker as below:

```bash
$ docker run --rm --name test-mongo -d mongo && \
> docker run --rm --name test-parse-server -p 1337:1337 -e VERBOSE=0 \
>            -v $(pwd):/parse-server/cloud --link test-mongo parseplatform/parse-server \
>                --appId test-app --masterKey "M@stErK3y" \
>                --databaseURI "mongodb://test-mongo/test" --cloud /parse-server/cloud/main.js
...

[1] parse-server running on http://localhost:1337/parse
...
```

After running the test script in a separate terminal:

```bash
$ node test_context.js 
Created { foo: 'bar',
  createdAt: '2020-11-09T07:42:11.956Z',
  updatedAt: '2020-11-09T07:42:11.956Z',
  objectId: 'zwZdxCML9F' }
Updated { foo: 'baaaah',
  createdAt: '2020-11-09T07:42:11.956Z',
  updatedAt: '2020-11-09T07:42:12.043Z',
  objectId: 'zwZdxCML9F' }
```

You will see this in the server logs (split into two
chunks: (1) create then (2) update):

**Create**
```
BEFORE: undefined -> { foo: 'bar' }
info: beforeSave triggered for Thing for user undefined:
  Input: {"foo":"bar"}
  Result: {"object":{"foo":"bar"}} {"className":"Thing","triggerType":"beforeSave"}
AFTER: undefined -> {
  foo: 'bar',
  createdAt: '2020-11-09T07:42:11.956Z',
  updatedAt: '2020-11-09T07:42:11.956Z',
  objectId: 'zwZdxCML9F'
}
info: afterSave triggered for Thing for user undefined:
  Input: {"foo":"bar","createdAt":"2020-11-09T07:42:11.956Z","updatedAt":"2020-11-09T07:42:11.956Z","objectId":"zwZdxCML9F"} {"className":"Thing","triggerType":"afterSave"}
info: afterSave triggered for Thing for user undefined:
  Input: {"foo":"bar","createdAt":"2020-11-09T07:42:11.956Z","updatedAt":"2020-11-09T07:42:11.956Z","objectId":"zwZdxCML9F"}
  Result: undefined {"className":"Thing","triggerType":"afterSave"}
```

**Update**
```
BEFORE: {
  foo: 'bar',
  createdAt: '2020-11-09T07:42:11.956Z',
  updatedAt: '2020-11-09T07:42:11.956Z',
  objectId: 'zwZdxCML9F'
} -> {
  foo: 'baaaah',
  createdAt: '2020-11-09T07:42:11.956Z',
  updatedAt: '2020-11-09T07:42:11.956Z',
  objectId: 'zwZdxCML9F'
}
info: beforeSave triggered for Thing for user undefined:
  Input: {"foo":"baaaah","createdAt":"2020-11-09T07:42:11.956Z","updatedAt":"2020-11-09T07:42:11.956Z","objectId":"zwZdxCML9F"}
  Result: {"object":{"foo":"baaaah"}} {"className":"Thing","triggerType":"beforeSave"}
AFTER: {
  foo: 'bar',
  createdAt: '2020-11-09T07:42:11.956Z',
  updatedAt: '2020-11-09T07:42:11.956Z',
  objectId: 'zwZdxCML9F'
} -> {
  foo: 'baaaah',
  createdAt: '2020-11-09T07:42:11.956Z',
  updatedAt: '2020-11-09T07:42:12.043Z',
  objectId: 'zwZdxCML9F'
}
info: afterSave triggered for Thing for user undefined:
  Input: {"foo":"baaaah","createdAt":"2020-11-09T07:42:11.956Z","updatedAt":"2020-11-09T07:42:12.043Z","objectId":"zwZdxCML9F"} {"className":"Thing","triggerType":"afterSave"}
info: afterSave triggered for Thing for user undefined:
  Input: {"foo":"baaaah","createdAt":"2020-11-09T07:42:11.956Z","updatedAt":"2020-11-09T07:42:12.043Z","objectId":"zwZdxCML9F"}
  Result: undefined {"className":"Thing","triggerType":"afterSave"}
```

As you can see in the final part of the logs above, the
original object and the saved object are sent through to
`afterSave`.
