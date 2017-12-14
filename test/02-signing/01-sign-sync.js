import test from 'ava';

var OpenDKIM = require('../../');

test('test sign_sync method with no argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.sign_sync();
    t.fail();
  } catch (err) {
    t.is(err.message, 'sign(): Wrong number of arguments');
  }
});

test('test sign_sync method with numeric argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.sign_sync(1);
    t.fail();
  } catch (err) {
    t.is(err.message, 'sign(): Argument should be an object');
  }
});

test('test sign_sync method with string argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.sign_sync('test');
    t.fail();
  } catch (err) {
    t.is(err.message, 'sign(): Argument should be an object');
  }
});

test('test sign_sync method with missing secretkey arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.sign_sync({
      id: undefined
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'sign(): secretkey is undefined');
  }
});

test('test sign_sync method with missing selector arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.sign_sync({
      id: undefined,
      secretkey: 'testkey'
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'sign(): selector is undefined');
  }
});

test('test sign_sync method with missing domain arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.sign_sync({
      id: undefined,
      secretkey: 'testkey',
      selector: 'a1b2c3'
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'sign(): domain is undefined');
  }
});

test('test sign_sync method with missing hdrcanon arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.sign_sync({
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

test('test sign_sync method with missing bodycanon arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.sign_sync({
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

test('test sign_sync method works as object with correct args', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.sign_sync({
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
