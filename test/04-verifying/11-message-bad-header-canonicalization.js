import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test message with bad header canonicalization', t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    opendkim.chunk({
      message: messages.bad_header_canonicalization,
      length: messages.bad_header_canonicalization.length
    });
    opendkim.chunk_end();
    t.fail();
  } catch (err) {
    t.is(err.message, 'Unable to verify');
  }
});
