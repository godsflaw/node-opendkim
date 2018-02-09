import test from 'ava';

var OpenDKIM = require('../../');

test('test flush_cache with no active cache', async t => {
  try {
    var opendkim = new OpenDKIM();
    var result = await opendkim.flush_cache();
    t.is(result, undefined);
  } catch (err) {
    t.fail(err);
  }
});

test.cb('test flush_cache with no active cache (errback)', t => {
  t.plan(2);
  var opendkim = new OpenDKIM();
  opendkim.flush_cache(function (err, result) {
    t.is(err, undefined);
    t.is(result, undefined);
    t.end();
  });
});
