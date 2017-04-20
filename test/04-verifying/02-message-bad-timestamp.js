import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

// TODO(godsflaw): once we have the interface, check the signature here.
// (e.g.
//   sig = dkim_getsignature(dkim);
//   assert(dkim_sig_geterror(sig) == DKIM_SIGERROR_EXPIRED);
// )
test('test message with bad timestamp', t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    opendkim.chunk({
      message: messages.bad_timestamp,
      length: messages.bad_timestamp.length
    });
    opendkim.chunk_end();
    t.fail();
  } catch (err) {
    t.is(err.message, 'Unable to verify');
  }
});
