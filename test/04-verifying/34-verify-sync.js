import test from 'ava';

var OpenDKIM = require('../../');

test('test verify_sync method with no argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify_sync();
    t.fail();
  } catch (err) {
    t.is(err.message, 'verify(): Wrong number of arguments');
  }
});

test('test verify_sync method with numeric argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify_sync(1);
    t.fail();
  } catch (err) {
    t.is(err.message, 'verify(): Argument should be an object');
  }
});

test('test verify_sync method with string argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify_sync('test');
    t.fail();
  } catch (err) {
    t.is(err.message, 'verify(): Argument should be an object');
  }
});

test('test verify_sync method works as object with correct args', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify_sync({
      id: undefined
    });
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});
