import test from 'ava';

var OpenDKIM = require('../../');

test('test verify method with no argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify();
  } catch (err) {
    t.is(err.message, 'verify(): Wrong number of arguments');
  }
});

test('test verify method with numeric argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify(1);
  } catch (err) {
    t.is(err.message, 'verify(): Argument should be an object');
  }
});

test('test verify method with string argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify('test');
  } catch (err) {
    t.is(err.message, 'verify(): Argument should be an object');
  }
});

test('test verify method with missing secretkey arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify({
      id: undefined
    });
  } catch (err) {
    t.is(err.message, 'verify(): secretkey is undefined');
  }
});

test('test verify method works as object with correct args', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify({
      id: undefined
    });
  } catch (err) {
    t.is(err.message, 'verify(): selector is undefined');
  }
});
