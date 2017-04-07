import test from 'ava';

var OpenDKIM = require('../../');

test('test chunk_end needs context', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.chunk_end();
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk_end(): sign() or verify(), then chunk() must be called first');
  }
});

// TODO(godsflaw): get a real message to test here.
// test('test chunk_end works after chunk', t => {
//   try {
//     var opendkim = new OpenDKIM();
//     opendkim.verify({id: undefined});
//     var message = 'From: <herp@derp.com>\r\n';
//     message += '\r\n';
//     message += 'this is a test';
//     opendkim.chunk({
//       message: message,
//       length: message.length
//     });
//     opendkim.chunk_end();
//     t.pass();
//   } catch (err) {
//     console.log(err);
//     t.fail();
//   }
// });
