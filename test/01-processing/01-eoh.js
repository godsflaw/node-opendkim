import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test eoh needs context', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.eoh();
    t.fail();
  } catch (err) {
    t.is(err.message, 'eoh(): sign() or verify(), then header() must be called first');
  }
});

test.cb('test eoh needs context (errback)', t => {
  t.plan(2);
  var opendkim = new OpenDKIM();
  opendkim.eoh(function (err, result) {
    t.is(result, undefined);
    t.is(err.message, 'eoh(): sign() or verify(), then header() must be called first');
    t.end();
  });
});

test('test eoh method works after header calls', async t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify({id: undefined});
    var header = messages.good.substring(0, messages.good.indexOf('\r\n\r\n'));
    var headers = header.replace(/\r\n\t/g, ' ').split(/\r\n/);
    for (var i = 0; i < headers.length; i++) {
      var line = headers[i];
      await opendkim.header({
        header: line,
        length: line.length
      });
    }
    await opendkim.eoh();
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test.cb('test eoh method works after header calls (errback)', t => {
  t.plan(3);
  var opendkim = new OpenDKIM();
  opendkim.verify({id: undefined});
  var header = messages.good.substring(0, messages.good.indexOf('\r\n\r\n'));
  var headers = header.replace(/\r\n\t/g, ' ').split(/\r\n/);
  for (var i = 0; i < headers.length; i++) {
    var line = headers[i];
    opendkim.header_sync({
      header: line,
      length: line.length
    });
  }
  opendkim.eoh(function (err, result) {
    t.is(err, undefined);
    t.is(result, undefined);
    t.pass();
    t.end();
  });
});
