import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test sig_getidentity before verify', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');
    opendkim.sig_getidentity();
    t.fail();
  } catch (err) {
    t.is(err.message, 'sig_getidentity(): library must be initialized first');
  }
});

test('test sig_getidentity before chunk_end', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    await opendkim.chunk({
      message: messages.good,
      length: messages.good.length
    });

    var identity = opendkim.sig_getidentity();
    t.is(identity, '@example.com');
    t.fail();
  } catch (err) {
    t.is(
      err.message,
      'sig_getidentity(): get_signature() failed, call it first for more details'
    );
  }
});

test('test sig_getidentity after chunk', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    await opendkim.chunk({
      message: messages.good,
      length: messages.good.length
    });
    await opendkim.chunk_end();
    var identity = opendkim.sig_getidentity();
    t.is(identity, '@example.com');
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('test a more pedantic sig_getidentity', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    await opendkim.chunk({
      message: messages.good,
      length: messages.good.length
    });
    await opendkim.chunk_end();
    opendkim.get_signature();
    var identity = opendkim.sig_getidentity();
    t.is(identity, '@example.com');
  } catch (err) {
    console.log(err);
    t.fail();
  }
});
