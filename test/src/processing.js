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

test('test body method with no argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.body();
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): Wrong number of arguments');
  }
});

test('test body method with numeric argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.body(1);
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): Argument should be an object');
  }
});

test('test body method with string argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.body('test');
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): Argument should be an object');
  }
});

test('test body method with missing body arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.body({
      // nothing
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): body is undefined');
  }
});

test('test body method with missing length arg', t => {
  try {
    var opendkim = new OpenDKIM();
    var body = 'This is a test';
    opendkim.body({
      body: body
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): length must be defined and non-zero');
  }
});

test('test body needs context', t => {
  try {
    var opendkim = new OpenDKIM();
    var body = 'This is a test';
    opendkim.body({
      body: body,
      length: body.length
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): sign() or verify() must be called first');
  }
});

test('test body method works after header and eoh', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify({id: undefined});
    var header = 'From: <herp@derp.com>';
    opendkim.header({
      header: header,
      length: header.length
    });
    opendkim.eoh();
    var body = 'this is a test';
    opendkim.body({
      body: body,
      length: body.length
    });
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

test('test eom method works after header, eoh, and body calls', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify({id: undefined});
    var header = 'From: <herp@derp.com>';
    opendkim.header({
      header: header,
      length: header.length
    });
    opendkim.eoh();
    var body = 'this is a test';
    opendkim.body({
      body: body,
      length: body.length
    });
    opendkim.eom();
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});
