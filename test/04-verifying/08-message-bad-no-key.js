import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test message with no key', async t => {
  var opendkim = new OpenDKIM();

  try {
    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    await opendkim.chunk({
      message: messages.bad_no_key,
      length: messages.bad_no_key.length
    });
    await opendkim.chunk_end();
    t.fail();
  } catch (err) {
    t.is(
      opendkim.sig_geterrorstr(opendkim.sig_geterror()),
      'key not found in DNS'
    );
    t.is(err.message, 'No key');
  }
});
