import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test message with bad extra signature spaces', t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    opendkim.chunk({
      message: messages.bad_extra_signature_spaces,
      length: messages.bad_extra_signature_spaces.length
    });
    opendkim.chunk_end();
    t.fail();
  } catch (err) {
    t.is(err.message, 'Bad signature');
  }
});
