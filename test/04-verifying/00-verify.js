import test from 'ava';

var OpenDKIM = require('../../');

test('test verify method with no argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify();
    t.fail();
  } catch (err) {
    t.is(err.message, 'verify(): Argument should be an object');
  }
});

test('test verify method with numeric argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify(1);
    t.fail();
  } catch (err) {
    t.is(err.message, 'verify(): Argument should be an object');
  }
});

test('test verify method with string argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify('test');
    t.fail();
  } catch (err) {
    t.is(err.message, 'verify(): Argument should be an object');
  }
});

test('test verify method works as object with correct args', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify({
      id: undefined
    });
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});
