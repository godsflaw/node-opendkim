import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test message with an altered body', async t => {
  var opendkim = new OpenDKIM();

  try {
    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    await opendkim.chunk({
      message: messages.bad_altered_body,
      length: messages.bad_altered_body.length
    });
    await opendkim.chunk_end();
    t.fail();
  } catch (err) {
    t.is(
      opendkim.sig_geterrorstr(opendkim.sig_geterror()),
      'signature verification failed'
    );
    t.is(err.message, 'Bad signature');
  }
});
