import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test get_canonlen message lengh', t => {
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

    var canonResult = opendkim.get_canonlen();

    t.is(canonResult.msglen, 347);
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('test get_canonlen canonicalized lengh', t => {
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

    var canonResult = opendkim.get_canonlen();

    t.is(canonResult.canonlen, 343);
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('test get_canonlen no signature lengh limit provided', t => {
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

    var canonResult = opendkim.get_canonlen();

    t.is(canonResult.signlen, -1);
  } catch (err) {
    console.log(err);
    t.fail();
  }
});
