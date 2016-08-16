import test from 'ava';

var OpenDKIM = require('../../');

test('test sign method with no argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.sign();
  } catch (err) {
    t.is(err.message, 'sign(): Wrong number of arguments');
  }
});

test('test sign method with numeric argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.sign(1);
  } catch (err) {
    t.is(err.message, 'sign(): Argument should be an object');
  }
});

test('test sign method with string argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.sign('test');
  } catch (err) {
    t.is(err.message, 'sign(): Argument should be an object');
  }
});

test('test sign method with missing secretkey arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.sign({
      id: undefined
    });
  } catch (err) {
    t.is(err.message, 'sign(): secretkey is undefined');
  }
});

test('test sign method with missing selector arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.sign({
      id: undefined,
      secretkey: 'testkey'
    });
  } catch (err) {
    t.is(err.message, 'sign(): selector is undefined');
  }
});

test('test sign method with missing domain arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.sign({
      id: undefined,
      secretkey: 'testkey',
      selector: 'a1b2c3'
    });
  } catch (err) {
    t.is(err.message, 'sign(): domain is undefined');
  }
});

test('test sign method with missing hdrcanon arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.sign({
      id: undefined,
      secretkey: 'testkey',
      selector: 'a1b2c3',
      domain: 'example.com'
    });
  } catch (err) {
    t.is(err.message, 'sign(): hdrcanon is undefined');
  }
});

test('test sign method with missing bodycanon arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.sign({
      id: undefined,
      secretkey: 'testkey',
      selector: 'a1b2c3',
      domain: 'example.com',
      hdrcanon: 'relaxed'
    });
  } catch (err) {
    t.is(err.message, 'sign(): bodycanon is undefined');
  }
});

test('test sign method with missing signalg arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.sign({
      id: undefined,
      secretkey: 'testkey',
      selector: 'a1b2c3',
      domain: 'example.com',
      hdrcanon: 'relaxed',
      bodycanon: 'relaxed'
    });
  } catch (err) {
    t.is(err.message, 'sign(): signalg is undefined');
  }
});

test('test sign method works as object with correct args', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.sign({
      id: undefined,
      secretkey: 'testkey',
      selector: 'a1b2c3',
      domain: 'example.com',
      hdrcanon: 'relaxed',
      bodycanon: 'relaxed',
      signalg: 'sha256',
      length: -1
    });
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});
