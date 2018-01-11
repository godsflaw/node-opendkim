import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test eom needs context', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.eom();
    t.fail();
  } catch (err) {
    t.is(err.message, 'eom(): sign() or verify(), then body() must be called first');
  }
});

test('test eom works after header, eoh, and body calls', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    var header = messages.good.substring(0, messages.good.indexOf('\r\n\r\n'));
    var body = messages.good.substring(messages.good.indexOf('\r\n\r\n') + 4);
    var headers = header.replace(/\r\n\t/g, ' ').split(/\r\n/);
    for (var i = 0; i < headers.length; i++) {
      var line = headers[i];
      opendkim.header({
        header: line,
        length: line.length
      });
    }
    await opendkim.eoh();
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

test('test eom chaining', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    var header = messages.good.substring(0, messages.good.indexOf('\r\n\r\n'));
    var body = messages.good.substring(messages.good.indexOf('\r\n\r\n') + 4);
    var headers = header.replace(/\r\n\t/g, ' ').split(/\r\n/);
    for (var i = 0; i < headers.length; i++) {
      var line = headers[i];
      opendkim.header({
        header: line,
        length: line.length
      });
    }
    await opendkim.eoh();
    opendkim.body({
      body: body,
      length: body.length
    });
    opendkim.eom().sig_getdomain();
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('test eom testkey', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    var header = messages.good.substring(0, messages.good.indexOf('\r\n\r\n'));
    var body = messages.good.substring(messages.good.indexOf('\r\n\r\n') + 4);
    var headers = header.replace(/\r\n\t/g, ' ').split(/\r\n/);
    for (var i = 0; i < headers.length; i++) {
      var line = headers[i];
      opendkim.header({
        header: line,
        length: line.length
      });
    }
    await opendkim.eoh();
    opendkim.body({
      body: body,
      length: body.length
    });
    var istest = opendkim.eom({testkey: true});
    if (!istest) { // this is a test
      t.fail();
    }
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});
