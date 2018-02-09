import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test chunk_end_sync needs context', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.chunk_end_sync();
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk_end(): sign() or verify(), then chunk() must be called first');
  }
});

test('test chunk_end_sync without calling chunk', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify_sync({id: 'testing'});
    opendkim.chunk_end_sync();
    t.fail();
  } catch (err) {
    t.is(err.message, 'Syntax error');
  }
});

test('test chunk_end_sync works after chunk', t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify_sync({id: 'testing'});
    opendkim.chunk_sync({
      message: messages.good,
      length: messages.good.length
    });
    opendkim.chunk_end_sync();
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});
