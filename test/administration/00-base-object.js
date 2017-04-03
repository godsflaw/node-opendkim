import test from 'ava';

var OpenDKIM = require('../../');

test('new OpenDKIM is an empty object', t => {
  try {
    var opendkim = new OpenDKIM();
    t.deepEqual(opendkim, {});
  } catch (err) {
    t.fail(err.message);
  }
});
