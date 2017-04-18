'use strict';

import test from 'ava';

var OpenDKIM = require('../../');

test('check default is empty', t => {
  try {
    var opendkim = new OpenDKIM();
    var tmpdir = opendkim.tmpdir();
    t.is(tmpdir, '');
  } catch (err) {
    t.fail(err.message);
  }
});

test('test that data is never empty on set', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.tmpdir('');
    t.fail();
  } catch (err) {
    t.is(err.message, 'tmpdir(): data is empty');
  }
});

test('test get/set', t => {
  try {
    var opendkim = new OpenDKIM();
    var tmpdir = opendkim.tmpdir();
    t.is(tmpdir, '');
    opendkim.tmpdir('/var/tmp');
    tmpdir = opendkim.tmpdir();
    t.is(tmpdir, '/var/tmp');
    opendkim.tmpdir('/tmp');
    tmpdir = opendkim.tmpdir();
    t.is(tmpdir, '/tmp');
  } catch (err) {
    t.fail(err.message);
  }
});
