import test from 'ava';

var OpenDKIM = require('../../');

test('test header_sync method with no argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.header_sync();
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): Argument should be an object');
  }
});

test('test header_sync method with numeric argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.header_sync(1);
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): Argument should be an object');
  }
});

test('test header_sync method with string argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.header_sync('test');
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): Argument should be an object');
  }
});

test('test header_sync method with missing header arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.header_sync({
      // nothing
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): header is undefined');
  }
});

test('test header_sync method with missing length arg', t => {
  try {
    var opendkim = new OpenDKIM();
    var header = 'X-Derp: herp derp';
    opendkim.header_sync({
      header: header
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): length must be defined and non-zero');
  }
});

test('test header_sync needs context', t => {
  try {
    var opendkim = new OpenDKIM();
    var header = 'X-Derp: herp derp';
    opendkim.header_sync({
      header: header,
      length: header.length
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): sign() or verify() must be called first');
  }
});

test('test header_sync method works as object with correct args', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify({id: undefined});
    var header = 'From: <herp@derp.com>';
    opendkim.header_sync({
      header: header,
      length: header.length
    });
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});
