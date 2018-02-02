import test from 'ava';

var OpenDKIM = require('../../');

test('test header method with no argument', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.header();
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): Wrong number of arguments');
  }
});

test.cb('test header method with no argument (errback)', t => {
  t.plan(2);
  var opendkim = new OpenDKIM();
  opendkim.header(function (err, result) {
    t.is(result, undefined);
    t.is(err.message, 'header(obj, func): Wrong number of arguments');
    t.end();
  });
});

test('test header method with numeric argument', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.header(1);
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): Argument should be an object');
  }
});

test('test header method with string argument', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.header('test');
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): Argument should be an object');
  }
});

test.cb('test header method with string argument (errback)', t => {
  t.plan(2);
  var opendkim = new OpenDKIM();
  opendkim.header('test', function (err, result) {
    t.is(result, undefined);
    t.is(err.message, 'header(): Argument should be an object');
    t.end();
  });
});

test('test header method with missing header arg', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.header({
      // nothing
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): header is undefined');
  }
});

test('test header method with missing length arg', async t => {
  try {
    var opendkim = new OpenDKIM();
    var header = 'X-Derp: herp derp';
    await opendkim.header({
      header: header
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): length must be defined and non-zero');
  }
});

test('test header needs context', async t => {
  try {
    var opendkim = new OpenDKIM();
    var header = 'X-Derp: herp derp';
    await opendkim.header({
      header: header,
      length: header.length
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): sign() or verify() must be called first');
  }
});

test('test header method works as object with correct args', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.verify({id: undefined});
    var header = 'From: <herp@derp.com>';
    await opendkim.header({
      header: header,
      length: header.length
    });
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test.cb('test header method works as object with correct args (errback)', t => {
  t.plan(3);
  var opendkim = new OpenDKIM();
  opendkim.verify_sync({id: undefined});
  var header = 'From: <herp@derp.com>';
  opendkim.header({
    header: header,
    length: header.length
  }, function (err, result) {
    t.is(err, undefined);
    t.is(result, undefined);
    t.pass();
    t.end();
  });
});
