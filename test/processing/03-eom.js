import test from 'ava';

var OpenDKIM = require('../../');

test('test eom needs context', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.eom();
    t.fail();
  } catch (err) {
    t.is(err.message, 'eom(): sign() or verify(), then body() must be called first');
  }
});

test('test eom works after header, eoh, and body calls', t => {
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
