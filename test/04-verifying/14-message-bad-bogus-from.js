import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test message with bogus from header', async t => {
  var opendkim = new OpenDKIM();

  try {
    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    await opendkim.chunk({
      message: messages.bad_bogus_from,
      length: messages.bad_bogus_from.length
    });
    opendkim.chunk_end();
    t.fail();
  } catch (err) {
    // This isn't the best test, since lots of things end in a
    // syntax error, but this failed when parsing headers with
    // the bogus timestamp.
    t.is(err.message, 'Syntax error');
  }
});
