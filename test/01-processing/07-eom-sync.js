import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test eom_sync needs context', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.eom_sync();
    t.fail();
  } catch (err) {
    t.is(err.message, 'eom(): sign() or verify(), then body() must be called first');
  }
});

test('test eom_sync works after header, eoh, and body calls', t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify_sync({id: undefined});
    var header = messages.good.substring(0, messages.good.indexOf('\r\n\r\n'));
    var body = messages.good.substring(messages.good.indexOf('\r\n\r\n') + 4);
    var headers = header.replace(/\r\n\t/g, ' ').split(/\r\n/);
    for (var i = 0; i < headers.length; i++) {
      var line = headers[i];
      opendkim.header_sync({
        header: line,
        length: line.length
      });
    }
    opendkim.eoh_sync();
    opendkim.body_sync({
      body: body,
      length: body.length
    });
    opendkim.eom_sync();
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('test eom_sync chaining', t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify_sync({id: undefined});
    var header = messages.good.substring(0, messages.good.indexOf('\r\n\r\n'));
    var body = messages.good.substring(messages.good.indexOf('\r\n\r\n') + 4);
    var headers = header.replace(/\r\n\t/g, ' ').split(/\r\n/);
    for (var i = 0; i < headers.length; i++) {
      var line = headers[i];
      opendkim.header_sync({
        header: line,
        length: line.length
      });
    }
    opendkim.eoh_sync();
    opendkim.body_sync({
      body: body,
      length: body.length
    });
    opendkim.eom_sync().sig_getdomain();
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('test eom_sync testkey', t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify_sync({id: undefined});
    var header = messages.good.substring(0, messages.good.indexOf('\r\n\r\n'));
    var body = messages.good.substring(messages.good.indexOf('\r\n\r\n') + 4);
    var headers = header.replace(/\r\n\t/g, ' ').split(/\r\n/);
    for (var i = 0; i < headers.length; i++) {
      var line = headers[i];
      opendkim.header_sync({
        header: line,
        length: line.length
      });
    }
    opendkim.eoh_sync();
    opendkim.body_sync({
      body: body,
      length: body.length
    });
    var istest = opendkim.eom_sync({testkey: true});
    if (!istest) { // this is a test
      t.fail();
    }
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});
