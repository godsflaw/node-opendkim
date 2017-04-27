import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test chunk with no argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.chunk();
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): Wrong number of arguments');
  }
});

test('test chunk with numeric argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.chunk(1);
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): Argument should be an object');
  }
});

test('test chunk with string argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.chunk('test');
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): Argument should be an object');
  }
});

test('test chunk with missing chunk arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.chunk({
      // nothing
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): message is undefined');
  }
});

test('test chunk with missing length arg', t => {
  try {
    var opendkim = new OpenDKIM();
    var message = 'From: <herp@derp.com>\r\n';
    message += '\r\n';
    message += 'this is a test';
    opendkim.chunk({
      message: message
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): length must be defined and non-zero');
  }
});

test('test chunk needs context', t => {
  try {
    var opendkim = new OpenDKIM();
    var message = 'From: <herp@derp.com>\r\n';
    message += '\r\n';
    message += 'this is a test';
    opendkim.chunk({
      message: message,
      length: message.length
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): sign() or verify() must be called first');
  }
});

test('test chunk works', t => {
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
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('test many chunks', t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    var chunks = 16;
    var numChunks = Math.ceil(messages.good.length / chunks);

    opendkim.verify({id: undefined});

    for (var i = 0, o = 0; i < numChunks; ++i, o += chunks) {
      var chunk = messages.good.substr(o, chunks);
      opendkim.chunk({
        message: chunk,
        length: chunk.length
      });
    }

    opendkim.chunk_end();
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

// For more usage of the chunk() interface check test/04-verifying/*
