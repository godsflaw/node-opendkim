import test from 'ava';

var OpenDKIM = require('../../');

test('test verify method with no argument', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.verify();
    t.fail();
  } catch (err) {
    t.is(err.message, 'verify(): Wrong number of arguments');
  }
});

test.cb('test verify method with no argument (errback)', t => {
  t.plan(2);
  var opendkim = new OpenDKIM();
  opendkim.verify(function (err, result) {
    t.is(result, undefined);
    t.is(err.message, 'verify(obj, func): Wrong number of arguments');
    t.end();
  });
});

test('test verify method with numeric argument', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.verify(1);
    t.fail();
  } catch (err) {
    t.is(err.message, 'verify(): Argument should be an object');
  }
});

test('test verify method with string argument', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.verify('test');
    t.fail();
  } catch (err) {
    t.is(err.message, 'verify(): Argument should be an object');
  }
});

test.cb('test verify method with string argument (errback)', t => {
  t.plan(2);
  var opendkim = new OpenDKIM();
  opendkim.verify('test', function (err, result) {
    t.is(result, undefined);
    t.is(err.message, 'verify(): Argument should be an object');
    t.end();
  });
});

test('test verify method works as object with correct args', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.verify({
      id: undefined
    });
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test.cb('test verify method works as object with correct args (errback)', t => {
  t.plan(3);
  var opendkim = new OpenDKIM();
  opendkim.verify({
    id: undefined
  }, function (err, result) {
    t.is(err, undefined);
    t.is(result, undefined);
    t.pass();
    t.end();
  });
});
