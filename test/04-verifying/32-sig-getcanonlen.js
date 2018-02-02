import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test sig_getcanonlen message length', t => {
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

    var canonResult = opendkim.sig_getcanonlen();

    t.is(canonResult.msglen, 347);
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('test sig_getcanonlen canonicalized length', t => {
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

    var canonResult = opendkim.sig_getcanonlen();

    t.is(canonResult.canonlen, 343);  // Difference can be explained by trailing blank lines
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('test sig_getcanonlen no signature length limit provided', t => {
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

    var canonResult = opendkim.sig_getcanonlen();

    t.is(canonResult.signlen, -1);
  } catch (err) {
    console.log(err);
    t.fail();
  }
});
