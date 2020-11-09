const Parse = require('parse/node');

Parse.initialize('test-app', null, 'M@stErK3y');
Parse.serverURL = 'http://localhost:1337/parse';

const Thing = Parse.Object.extend('Thing');
const thing = new Thing();

thing.save({ foo: 'bar' })
     .then((t1) => {
       console.log('Created %o', t1.toJSON());
       return t1.save({ foo: 'baaaah' });
     })
     .then((t2) => console.log('Updated %o', t2.toJSON()));
