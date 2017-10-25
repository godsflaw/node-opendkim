import test from 'ava';

var OpenDKIM = require('../../');

test('test lib feature', t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.lib_feature('DKIM_FEATURE_DIFFHEADERS');
    opendkim.lib_feature('DKIM_FEATURE_PARSE_TIME');
    opendkim.lib_feature('DKIM_FEATURE_QUERY_CACHE');
    opendkim.lib_feature('DKIM_FEATURE_SHA256');
    opendkim.lib_feature('DKIM_FEATURE_DNSSEC');
    opendkim.lib_feature('DKIM_FEATURE_OVERSIGN');
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

