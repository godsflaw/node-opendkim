import test from 'ava';

var OpenDKIM = require('../../');

test('new OpenDKIM is an empty object', t => {
  var opendkim = new OpenDKIM();
  t.deepEqual(opendkim, {});
});
