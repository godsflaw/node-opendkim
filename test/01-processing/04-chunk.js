import test from 'ava';

var OpenDKIM = require('../../');

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
// TODO(godsflaw): add a real test here.
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
