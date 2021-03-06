import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test message with oversized l=', async t => {
  var opendkim = new OpenDKIM();

  try {
    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    await opendkim.verify({id: undefined});
    await opendkim.chunk({
      message: messages.bad_oversized_l,
      length: messages.bad_oversized_l.length
    });
    await opendkim.chunk_end();
    t.fail();
  } catch (err) {
    t.is(
      opendkim.sig_geterrorstr(opendkim.sig_geterror()),
      'length tag value exceeds body size'
    );
    t.is(err.message, 'Unable to verify');
  }
});
