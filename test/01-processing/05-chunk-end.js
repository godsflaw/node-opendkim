import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test chunk_end needs context', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.chunk_end();
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk_end(): sign() or verify(), then chunk() must be called first');
  }
});

test.cb('test chunk_end needs context (errback)', t => {
  t.plan(2);
  var opendkim = new OpenDKIM();
  opendkim.chunk_end(function (err, result) {
    t.is(result, undefined);
    t.is(err.message, 'chunk_end(): sign() or verify(), then chunk() must be called first');
    t.end();
  });
});

test('test chunk_end without calling chunk', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.verify({id: 'testing'});
    await opendkim.chunk_end();
    t.fail();
  } catch (err) {
    t.is(err.message, 'Syntax error');
  }
});

test.cb('test chunk_end without calling chunk (errback)', t => {
  t.plan(2);
  var opendkim = new OpenDKIM();
  opendkim.verify_sync({id: 'testing'});
  opendkim.chunk_end(function (err, result) {
    t.is(result, undefined);
    t.is(err.message, 'Syntax error');
    t.end();
  });
});

test('test chunk_end works after chunk', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    await opendkim.verify({id: 'testing'});
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

test.cb('test chunk_end works after chunk (errback)', t => {
  t.plan(3);
  var opendkim = new OpenDKIM();

  opendkim.query_method('DKIM_QUERY_FILE');
  opendkim.query_info('../fixtures/testkeys');

  opendkim.verify_sync({id: 'testing'});
  opendkim.chunk_sync({
    message: messages.good,
    length: messages.good.length
  });
  opendkim.chunk_end(function (err, result) {
    t.is(err, undefined);
    t.is(result, undefined);
    t.pass();
    t.end();
  });
});
