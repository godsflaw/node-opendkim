import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test chunk_end needs context', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.chunk_end();
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk_end(): sign() or verify(), then chunk() must be called first');
  }
});

test('test chunk_end without calling chunk', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify({id: 'testing'});
    opendkim.chunk_end();
    t.fail();
  } catch (err) {
    t.is(err.message, 'Syntax error');
  }
});

test('test chunk_end works after chunk', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: 'testing'});
    await opendkim.chunk({
      message: messages.good,
      length: messages.good.length
    });
    opendkim.chunk_end();
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});
