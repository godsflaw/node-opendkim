import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test eom needs context', async t => {
  try {
    var opendkim = new OpenDKIM();
    await opendkim.eom();
    t.fail();
  } catch (err) {
    t.is(err.message, 'eom(): sign() or verify(), then body() must be called first');
  }
});

test.cb('test eom needs context (errback)', t => {
  t.plan(2);
  var opendkim = new OpenDKIM();
  opendkim.eom(function (err, result) {
    t.is(result, undefined);
    t.is(err.message, 'eom(): sign() or verify(), then body() must be called first');
    t.end();
  });
});

test('test eom works after header, eoh, and body calls', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    await opendkim.verify({id: undefined});
    var header = messages.good.substring(0, messages.good.indexOf('\r\n\r\n'));
    var body = messages.good.substring(messages.good.indexOf('\r\n\r\n') + 4);
    var headers = header.replace(/\r\n\t/g, ' ').split(/\r\n/);
    for (var i = 0; i < headers.length; i++) {
      var line = headers[i];
      await opendkim.header({
        header: line,
        length: line.length
      });
    }
    await opendkim.eoh();
    await opendkim.body({
      body: body,
      length: body.length
    });
    await opendkim.eom();
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test.cb('test eom works after header, eoh, and body calls (errback)', t => {
  t.plan(3);
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
  opendkim.eom(function (err, result) {
    t.is(err, undefined);
    t.is(result, undefined);
    t.pass();
    t.end();
  });
});

test('test eom testkey', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    await opendkim.verify({id: undefined});
    var header = messages.good.substring(0, messages.good.indexOf('\r\n\r\n'));
    var body = messages.good.substring(messages.good.indexOf('\r\n\r\n') + 4);
    var headers = header.replace(/\r\n\t/g, ' ').split(/\r\n/);
    for (var i = 0; i < headers.length; i++) {
      var line = headers[i];
      await opendkim.header({
        header: line,
        length: line.length
      });
    }
    await opendkim.eoh();
    await opendkim.body({
      body: body,
      length: body.length
    });
    var istest = await opendkim.eom({testkey: true});
    if (!istest) { // this is a test
      t.fail();
    }
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});
