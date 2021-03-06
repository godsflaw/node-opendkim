import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test sig_getdomain before verify', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');
    opendkim.sig_getdomain();
    t.fail();
  } catch (err) {
    t.is(err.message, 'sig_getdomain(): library must be initialized first');
  }
});

test('test sig_getdomain before chunk_end', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    await opendkim.verify({id: undefined});
    await opendkim.chunk({
      message: messages.good,
      length: messages.good.length
    });

    var domain = opendkim.sig_getdomain();
    t.is(domain, 'example.com');
    t.fail();
  } catch (err) {
    t.is(
      err.message,
      'sig_getdomain(): get_signature() failed, call it first for more details'
    );
  }
});

test('test sig_getdomain after chunk', async t => {
  var opendkim = new OpenDKIM();

  try {
    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    await opendkim.verify({id: undefined});
    await opendkim.chunk({
      message: messages.good,
      length: messages.good.length
    });
    await opendkim.chunk_end();
    var domain = opendkim.sig_getdomain();
    t.is(domain, 'example.com');
  } catch (err) {
    console.log(err);
    var error = opendkim.sig_geterrorstr(opendkim.sig_geterror());
    console.log(error);
    t.fail();
  }
});

test('test a more pedantic sig_getdomain', async t => {
  var opendkim = new OpenDKIM();

  try {
    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    await opendkim.verify({id: undefined});
    await opendkim.chunk({
      message: messages.good,
      length: messages.good.length
    });
    await opendkim.chunk_end();
    opendkim.get_signature();
    var domain = opendkim.sig_getdomain();
    t.is(domain, 'example.com');
  } catch (err) {
    console.log(err);
    var error = opendkim.sig_geterrorstr(opendkim.sig_geterror());
    console.log(error);
    t.fail();
  }
});
