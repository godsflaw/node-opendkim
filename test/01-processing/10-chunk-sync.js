import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test chunk_sync with no argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.chunk_sync();
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): Argument should be an object');
  }
});

test('test chunk_sync with numeric argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.chunk_sync(1);
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): Argument should be an object');
  }
});

test('test chunk_sync with string argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.chunk_sync('test');
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): Argument should be an object');
  }
});

test('test chunk_sync with missing chunk arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.chunk_sync({
      // nothing
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): message is undefined');
  }
});

test('test chunk_sync with missing length arg', t => {
  try {
    var opendkim = new OpenDKIM();
    var message = 'From: <herp@derp.com>\r\n';
    message += '\r\n';
    message += 'this is a test';
    opendkim.chunk_sync({
      message: message
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): length must be defined and non-zero');
  }
});

test('test chunk_sync needs context', t => {
  try {
    var opendkim = new OpenDKIM();
    var message = 'From: <herp@derp.com>\r\n';
    message += '\r\n';
    message += 'this is a test';
    opendkim.chunk_sync({
      message: message,
      length: message.length
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): sign() or verify() must be called first');
  }
});

test('test chunk_sync works', t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify_sync({id: undefined});
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

test('test many chunk_sync', t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    var chunks = 16;
    var numChunks = Math.ceil(messages.good.length / chunks);

    opendkim.verify_sync({id: undefined});

    for (var i = 0, o = 0; i < numChunks; ++i, o += chunks) {
      var chunk = messages.good.substr(o, chunks);
      opendkim.chunk_sync({
        message: chunk,
        length: chunk.length
      });
    }

    opendkim.chunk_end_sync();
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});
