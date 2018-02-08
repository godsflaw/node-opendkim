import test from 'ava';

var OpenDKIM = require('../../');

test('test flush_cache_sync with no active cache', t => {
  try {
    var opendkim = new OpenDKIM();
    t.deepEqual(opendkim.flush_cache_sync(), opendkim);
  } catch (err) {
    t.fail(err.message);
  }
});
