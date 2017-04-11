import test from 'ava';

var OpenDKIM = require('../../');

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
