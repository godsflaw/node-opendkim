import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test get_signature before verify', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');
    opendkim.get_signature();
    t.fail();
  } catch (err) {
    t.is(err.message, 'get_signature(): library must be initialized first');
  }
});

test('test get_signature before chunk_end', async t => {
  var opendkim = new OpenDKIM();

  try {
    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    await opendkim.chunk({
      message: messages.good,
      length: messages.good.length
    });

    opendkim.get_signature();
    t.fail();
  } catch (err) {
    t.is(
      err.message,
      'get_signature(): either there was no signature or called before eom() or chunk_end()'
    );
  }
});

test('test get_signature after chunk', async t => {
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
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});
