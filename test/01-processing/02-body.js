import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test body method with no argument', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.body();
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): Wrong number of arguments');
  }
});

test.cb('test body method with no argument (errback)', t => {
  t.plan(2);
  var opendkim = new OpenDKIM();
  opendkim.body(function (err, result) {
    t.is(result, undefined);
    t.is(err.message, 'body(obj, func): Wrong number of arguments');
    t.end();
  });
});

test('test body method with numeric argument', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.body(1);
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): Argument should be an object');
  }
});

test('test body method with string argument', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.body('test');
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): Argument should be an object');
  }
});

test.cb('test body method with string argument (errback)', t => {
  t.plan(2);
  var opendkim = new OpenDKIM();
  opendkim.body('test', function (err, result) {
    t.is(result, undefined);
    t.is(err.message, 'body(): Argument should be an object');
    t.end();
  });
});

test('test body method with missing body arg', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.body({
      // nothing
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): body is undefined');
  }
});

test('test body method with missing length arg', async t => {
  try {
    var opendkim = new OpenDKIM();
    var body = 'This is a test';
    await opendkim.body({
      body: body
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): length must be defined and non-zero');
  }
});

test('test body needs context', async t => {
  try {
    var opendkim = new OpenDKIM();
    var body = 'This is a test';
    await opendkim.body({
      body: body,
      length: body.length
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): sign() or verify() must be called first');
  }
});

test.cb('test body method works after header and eoh (errback)', t => {
  t.plan(3);
  var opendkim = new OpenDKIM();
  opendkim.verify({id: undefined});
  var header = messages.good.substring(0, messages.good.indexOf('\r\n\r\n'));
  var body = messages.good.substring(messages.good.indexOf('\r\n\r\n') + 4);
  var headers = header.replace(/\r\n\t/g, ' ').split(/\r\n/);
  for (var i = 0; i < headers.length; i++) {
    var line = headers[i];
    opendkim.header_sync({
      header: line,
      length: line.length
    });
  }
  opendkim.eoh_sync();
  opendkim.body({
    body: body,
    length: body.length
  }, function (err, result) {
    t.is(err, undefined);
    t.is(result, undefined);
    t.pass();
    t.end();
  });
});

test('test body method works after header and eoh', async t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify({id: undefined});
    var header = messages.good.substring(0, messages.good.indexOf('\r\n\r\n'));
    var body = messages.good.substring(messages.good.indexOf('\r\n\r\n') + 4);
    var headers = header.replace(/\r\n\t/g, ' ').split(/\r\n/);
    for (var i = 0; i < headers.length; i++) {
      var line = headers[i];
      await opendkim.header({
        header: line,
        length: line.length
      });
    }
    await opendkim.eoh();
    await opendkim.body({
      body: body,
      length: body.length
    });
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});
