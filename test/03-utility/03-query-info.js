'use strict';

import test from 'ava';

var OpenDKIM = require('../../');

test('check default is empty', t => {
  try {
    var opendkim = new OpenDKIM();
    var query_info = opendkim.query_info();
    t.is(query_info, '');
  } catch (err) {
    t.fail(err.message);
  }
});

test('test that data is never empty on set', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.query_info('');
    t.fail();
  } catch (err) {
    t.is(err.message, 'query_info(): data is empty');
  }
});

test('test get/set', t => {
  try {
    var opendkim = new OpenDKIM();
    var query_info = opendkim.query_info();
    t.is(query_info, '');
    opendkim.query_info('/tmp/testkeys');
    query_info = opendkim.query_info();
    t.is(query_info, '/tmp/testkeys');
    opendkim.query_info('/tmp/foobar');
    query_info = opendkim.query_info();
    t.is(query_info, '/tmp/foobar');
  } catch (err) {
    t.fail(err.message);
  }
});
