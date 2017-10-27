import test from 'ava';

var OpenDKIM = require('../../');

test('test lib feature', t => {
  try {
    var opendkim = new OpenDKIM();

    t.is(typeof opendkim.lib_feature('DKIM_FEATURE_DIFFHEADERS'), 'boolean');
    t.is(typeof opendkim.lib_feature('DKIM_FEATURE_PARSE_TIME'), 'boolean');
    t.is(typeof opendkim.lib_feature('DKIM_FEATURE_QUERY_CACHE'), 'boolean');
    t.is(typeof opendkim.lib_feature('DKIM_FEATURE_SHA256'), 'boolean');
    t.is(typeof opendkim.lib_feature('DKIM_FEATURE_DNSSEC'), 'boolean');
    t.is(typeof opendkim.lib_feature('DKIM_FEATURE_OVERSIGN'), 'boolean');
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

