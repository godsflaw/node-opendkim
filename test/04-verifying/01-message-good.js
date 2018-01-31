import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test good message chunk', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    await opendkim.chunk({
      message: messages.good,
      length: messages.good.length
    });
    opendkim.chunk_end();
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('test good message multi-chunk', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    var chunks = 16;
    var numChunks = Math.ceil(messages.good.length / chunks);

    opendkim.verify({id: undefined});

    for (var i = 0, o = 0; i < numChunks; ++i, o += chunks) {
      var chunk = messages.good.substr(o, chunks);
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
