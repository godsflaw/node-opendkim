// Test it out
import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test ohdrs with good message', t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    opendkim.chunk({
      message: messages.good,
      length: messages.good.length
    });
    opendkim.chunk_end();
    opendkim.get_signature();
    opendkim.ohdrs();
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});
