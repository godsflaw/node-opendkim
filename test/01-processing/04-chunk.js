import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test chunk with no argument', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.chunk();
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): Wrong number of arguments');
  }
});

test.cb('test chunk with no argument (errback)', t => {
  t.plan(2);
  var opendkim = new OpenDKIM();
  opendkim.chunk(function (err, result) {
    t.is(result, undefined);
    t.is(err.message, 'chunk(obj, func): Wrong number of arguments');
    t.end();
  });
});

test('test chunk with numeric argument', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.chunk(1);
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): Argument should be an object');
  }
});

test('test chunk with string argument', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.chunk('test');
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): Argument should be an object');
  }
});

test.cb('test chunk with string argument (errback)', t => {
  t.plan(2);
  var opendkim = new OpenDKIM();
  opendkim.chunk('test', function (err, result) {
    t.is(result, undefined);
    t.is(err.message, 'chunk(): Argument should be an object');
    t.end();
  });
});

test('test chunk with missing chunk arg', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.chunk({
      // nothing
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): message is undefined');
  }
});

test('test chunk with missing length arg', async t => {
  try {
    var opendkim = new OpenDKIM();
    var message = 'From: <herp@derp.com>\r\n';
    message += '\r\n';
    message += 'this is a test';
    await opendkim.chunk({
      message: message
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): length must be defined and non-zero');
  }
});

test('test chunk needs context', async t => {
  try {
    var opendkim = new OpenDKIM();
    var message = 'From: <herp@derp.com>\r\n';
    message += '\r\n';
    message += 'this is a test';
    await opendkim.chunk({
      message: message,
      length: message.length
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): sign() or verify() must be called first');
  }
});

test.cb('test chunk works (errback)', t => {
  t.plan(3);
  var opendkim = new OpenDKIM();

  opendkim.query_method('DKIM_QUERY_FILE');
  opendkim.query_info('../fixtures/testkeys');

  opendkim.verify({id: undefined});
  opendkim.chunk({
    message: messages.good,
    length: messages.good.length
  }, function (err, result) {
    t.is(err, undefined);
    t.is(result, undefined);
    t.pass();
    opendkim.chunk_end_sync();
    t.end();
  });
});

test('test chunk works', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    await opendkim.chunk({
      message: messages.good,
      length: messages.good.length
    });
    await opendkim.chunk_end();
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('test many chunks', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    var chunks = 16;
    var numChunks = Math.ceil(messages.good.length / chunks);

    opendkim.verify({id: undefined});

    for (var i = 0, o = 0; i < numChunks; ++i, o += chunks) {
      var chunk = messages.good.substr(o, chunks);
      await opendkim.chunk({
        message: chunk,
        length: chunk.length
      });
    }

    await opendkim.chunk_end();
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

// For more usage of the chunk() interface check test/04-verifying/*
