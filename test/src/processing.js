import test from 'ava';

var OpenDKIM = require('../../');

test('test header method with no argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.header();
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): Wrong number of arguments');
  }
});

test('test header method with numeric argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.header(1);
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): Argument should be an object');
  }
});

test('test header method with string argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.header('test');
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): Argument should be an object');
  }
});

test('test header method with missing header arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.header({
      // nothing
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): header is undefined');
  }
});

test('test header method with missing length arg', t => {
  try {
    var opendkim = new OpenDKIM();
    var header = 'X-Derp: herp derp';
    opendkim.header({
      header: header
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): length must be defined and non-zero');
  }
});

test('test header needs context', t => {
  try {
    var opendkim = new OpenDKIM();
    var header = 'X-Derp: herp derp';
    opendkim.header({
      header: header,
      length: header.length
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): sign() or verify() must be called first');
  }
});

test('test header method works as object with correct args', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify({id: undefined});
    var header = 'From: <herp@derp.com>';
    opendkim.header({
      header: header,
      length: header.length
    });
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('test eoh needs context', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.eoh();
    t.fail();
  } catch (err) {
    t.is(err.message, 'eoh(): sign() or verify(), then header() must be called first');
  }
});

test('test eoh method works after header calls', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify({id: undefined});
    var header = 'From: <herp@derp.com>';
    opendkim.header({
      header: header,
      length: header.length
    });
    opendkim.eoh();
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('test eom needs context', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.eom();
    t.fail();
  } catch (err) {
    t.is(err.message, 'eom(): sign() or verify(), then body() must be called first');
  }
});
