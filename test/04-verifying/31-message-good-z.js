import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test good message with z= chunk', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    await opendkim.chunk({
      message: messages.good_z,
      length: messages.good_z.length
    });
    opendkim.chunk_end();
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('test good message with z= multi-chunk', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    var chunks = 16;
    var numChunks = Math.ceil(messages.good_z.length / chunks);

    opendkim.verify({id: undefined});

    for (var i = 0, o = 0; i < numChunks; ++i, o += chunks) {
      var chunk = messages.good_z.substr(o, chunks);
      await opendkim.chunk({
        message: chunk,
        length: chunk.length
      });
    }

    opendkim.chunk_end();
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('test ohdrs with z=', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    await opendkim.chunk({
      message: messages.good_z,
      length: messages.good_z.length
    });
    opendkim.chunk_end();
    opendkim.get_signature(); // this is needed for ohdrs to not throw an error
    var zheader = opendkim.ohdrs();
    t.is(zheader[0], 'Received: received data 1');
  } catch (err) {
    console.log(err);
    t.fail();
  }
});
