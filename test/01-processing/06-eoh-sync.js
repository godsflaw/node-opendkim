import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test eoh_sync needs context', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.eoh_sync();
    t.fail();
  } catch (err) {
    t.is(err.message, 'eoh(): sign() or verify(), then header() must be called first');
  }
});

test('test eoh_sync method works after header calls', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify_sync({id: undefined});
    var header = messages.good.substring(0, messages.good.indexOf('\r\n\r\n'));
    var headers = header.replace(/\r\n\t/g, ' ').split(/\r\n/);
    for (var i = 0; i < headers.length; i++) {
      var line = headers[i];
      opendkim.header_sync({
        header: line,
        length: line.length
      });
    }
    opendkim.eoh_sync();
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});
