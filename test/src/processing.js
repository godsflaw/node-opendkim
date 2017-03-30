import test from 'ava';

var OpenDKIM = require('../../');

test('test header with no argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.header();
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): Wrong number of arguments');
  }
});

test('test header with numeric argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.header(1);
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): Argument should be an object');
  }
});

test('test header with string argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.header('test');
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): Argument should be an object');
  }
});

test('test header with missing header arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.header({
      // nothing
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): header is undefined');
  }
});

test('test header with missing length arg', t => {
  try {
    var opendkim = new OpenDKIM();
    var header = 'X-Derp: herp derp';
    opendkim.header({
      header: header
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): length must be defined and non-zero');
  }
});

test('test header needs context', t => {
  try {
    var opendkim = new OpenDKIM();
    var header = 'X-Derp: herp derp';
    opendkim.header({
      header: header,
      length: header.length
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'header(): sign() or verify() must be called first');
  }
});

test('test header works as object with correct args', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify({id: undefined});
    var header = 'From: <herp@derp.com>';
    opendkim.header({
      header: header,
      length: header.length
    });
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('test eoh needs context', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.eoh();
    t.fail();
  } catch (err) {
    t.is(err.message, 'eoh(): sign() or verify(), then header() must be called first');
  }
});

test('test eoh works after header calls', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify({id: undefined});
    var header = 'From: <herp@derp.com>';
    opendkim.header({
      header: header,
      length: header.length
    });
    opendkim.eoh();
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('test body with no argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.body();
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): Wrong number of arguments');
  }
});

test('test body with numeric argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.body(1);
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): Argument should be an object');
  }
});

test('test body with string argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.body('test');
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): Argument should be an object');
  }
});

test('test body with missing body arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.body({
      // nothing
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): body is undefined');
  }
});

test('test body with missing length arg', t => {
  try {
    var opendkim = new OpenDKIM();
    var body = 'This is a test';
    opendkim.body({
      body: body
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): length must be defined and non-zero');
  }
});

test('test body needs context', t => {
  try {
    var opendkim = new OpenDKIM();
    var body = 'This is a test';
    opendkim.body({
      body: body,
      length: body.length
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): sign() or verify() must be called first');
  }
});

test('test body works after header and eoh', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify({id: undefined});
    var header = 'From: <herp@derp.com>';
    opendkim.header({
      header: header,
      length: header.length
    });
    opendkim.eoh();
    var body = 'this is a test';
    opendkim.body({
      body: body,
      length: body.length
    });
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('test eom needs context', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.eom();
    t.fail();
  } catch (err) {
    t.is(err.message, 'eom(): sign() or verify(), then body() must be called first');
  }
});

test('test eom works after header, eoh, and body calls', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify({id: undefined});
    var header = 'From: <herp@derp.com>';
    opendkim.header({
      header: header,
      length: header.length
    });
    opendkim.eoh();
    var body = 'this is a test';
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

test('test chunk with no argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.chunk();
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): Wrong number of arguments');
  }
});

test('test chunk with numeric argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.chunk(1);
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): Argument should be an object');
  }
});

test('test chunk with string argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.chunk('test');
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): Argument should be an object');
  }
});

test('test chunk with missing chunk arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.chunk({
      // nothing
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): message is undefined');
  }
});

test('test chunk with missing length arg', t => {
  try {
    var opendkim = new OpenDKIM();
    var message = 'From: <herp@derp.com>\r\n';
    message += '\r\n';
    message += 'this is a test';
    opendkim.chunk({
      message: message
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): length must be defined and non-zero');
  }
});

test('test chunk needs context', t => {
  try {
    var opendkim = new OpenDKIM();
    var message = 'From: <herp@derp.com>\r\n';
    message += '\r\n';
    message += 'this is a test';
    opendkim.chunk({
      message: message,
      length: message.length
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk(): sign() or verify() must be called first');
  }
});

test('test chunk works', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify({id: undefined});
//    var sig = 'v=1; a=rsa-sha1; c=relaxed/simple; d=example.com; s=test;\r\n\tt=1172620939; bh=ll/0h2aWgG+D3ewmE4Y3pY7Ukz8=; h=Received:Received:\r\n\t Received:From:To:Date:Subject:Message-ID; b=bj9kVUbnBYfe9sVzH9lT45\r\n\tTFKO3eQnDbXLfgmgu/b5QgxcnhT9ojnV2IAM4KUO8+hOo5sDEu5Co/0GASH0vHpSV4P\r\n\t377Iwew3FxvLpHsVbVKgXzoKD4QSbHRpWNxyL6LypaaqFa96YqjXuYXr0vpb88hticn\r\n\t6I16//WThMz8fMU=';
//    message = 'DKIM-Signature:' + sig + '\r\n';
    var message = 'From: Joe SixPack <joe@football.example.com>\r\n';
//    message += '\r\n';
//    message += 'this is a test';
    opendkim.chunk({
      message: message,
      length: message.length
    });
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('test chunk_end needs context', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.chunk_end();
    t.fail();
  } catch (err) {
    t.is(err.message, 'chunk_end(): sign() or verify(), then chunk() must be called first');
  }
});

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
