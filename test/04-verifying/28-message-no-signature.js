import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test no signature message chunk', t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    opendkim.chunk({
      message: messages.no_signature,
      length: messages.no_signature.length
    });
    opendkim.chunk_end();
    t.fail();
  } catch (err) {
    t.is(err.message, 'No signature');
  }
});

test('test no signature message multi-chunk', t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    var chunks = 16;
    var numChunks = Math.ceil(messages.no_signature.length / chunks);

    opendkim.verify({id: undefined});

    for (var i = 0, o = 0; i < numChunks; ++i, o += chunks) {
      var chunk = messages.no_signature.substr(o, chunks);
      opendkim.chunk({
        message: chunk,
        length: chunk.length
      });
    }
    opendkim.chunk_end();
    t.fail();
  } catch (err) {
    t.is(err.message, 'No signature');
  }
});

test('test no signature through header(), eoh(), body(), and eom()', async t => {
  // This test should bail at the eoh() point.
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    var header = messages.no_signature.substring(
      0, messages.no_signature.indexOf('\r\n\r\n')
    );
    var body = messages.no_signature.substring(
      messages.no_signature.indexOf('\r\n\r\n') + 4
    );
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
    t.fail();
  } catch (err) {
    t.is(err.message, 'No signature');
  }
});
