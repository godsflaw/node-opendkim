import test from 'ava';

var OpenDKIM = require('../../');

test('test sign method with no argument', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.sign();
    t.fail();
  } catch (err) {
    t.is(err.message, 'sign(): Wrong number of arguments');
  }
});

test.cb('test sign method with no argument (errback)', t => {
  t.plan(1);
  var opendkim = new OpenDKIM();
  opendkim.sign(function (err, result) {
    if (err) {
      t.is(err.message, 'sign(obj, func): Wrong number of arguments');
    } else {
      t.fail('got: ' + result);
    }
    t.end();
  });
});

test('test sign method with numeric argument', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.sign(1);
    t.fail();
  } catch (err) {
    t.is(err.message, 'sign(): Argument should be an object');
  }
});

test('test sign method with string argument', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.sign('test');
    t.fail();
  } catch (err) {
    t.is(err.message, 'sign(): Argument should be an object');
  }
});

test.cb('test sign method with string argument (errback)', t => {
  t.plan(2);
  var opendkim = new OpenDKIM();
  opendkim.sign('test', function (err, result) {
    t.is(result, undefined);
    t.is(err.message, 'sign(): Argument should be an object');
    t.end();
  });
});

test('test sign method with missing secretkey arg', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.sign({
      id: undefined
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'sign(): secretkey is undefined');
  }
});

test('test sign method with missing selector arg', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.sign({
      id: undefined,
      secretkey: 'testkey'
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'sign(): selector is undefined');
  }
});

test('test sign method with missing domain arg', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.sign({
      id: undefined,
      secretkey: 'testkey',
      selector: 'a1b2c3'
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'sign(): domain is undefined');
  }
});

test('test sign method with missing hdrcanon arg', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.sign({
      id: undefined,
      secretkey: 'testkey',
      selector: 'a1b2c3',
      domain: 'example.com'
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'sign(): hdrcanon is undefined');
  }
});

test('test sign method with missing bodycanon arg', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.sign({
      id: undefined,
      secretkey: 'testkey',
      selector: 'a1b2c3',
      domain: 'example.com',
      hdrcanon: 'relaxed'
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'sign(): bodycanon is undefined');
  }
});

test.cb('test sign method works as object with correct args (errback)', t => {
  t.plan(3);
  var opendkim = new OpenDKIM();
  opendkim.sign({
    id: undefined,
    secretkey: 'testkey',
    selector: 'a1b2c3',
    domain: 'example.com',
    hdrcanon: 'relaxed',
    bodycanon: 'relaxed',
    signalg: 'sha256',     // default is sha256
    length: -1
  }, function (err, result) {
    t.is(err, undefined);
    t.is(result, undefined);
    t.pass();
    t.end();
  });
});

test('test sign method works as object with correct args', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.sign({
      id: undefined,
      secretkey: 'testkey',
      selector: 'a1b2c3',
      domain: 'example.com',
      hdrcanon: 'relaxed',
      bodycanon: 'relaxed',
      signalg: 'sha256',     // default is sha256
      length: -1
    });
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});
