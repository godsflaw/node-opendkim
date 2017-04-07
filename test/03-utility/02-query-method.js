'use strict';

import test from 'ava';

var OpenDKIM = require('../../');

test('check default is DKIM_QUERY_DNS', t => {
  try {
    var opendkim = new OpenDKIM();
    var query_info = opendkim.query_method();
    t.is(query_info, 'DKIM_QUERY_DNS');
  } catch (err) {
    t.fail(err.message);
  }
});

test('test get/set', t => {
  try {
    var opendkim = new OpenDKIM();
    var query_info = opendkim.query_method();
    t.is(query_info, 'DKIM_QUERY_DNS');
    opendkim.query_method('DKIM_QUERY_FILE');
    query_info = opendkim.query_method();
    t.is(query_info, 'DKIM_QUERY_FILE');
    opendkim.query_method('DKIM_QUERY_DNS');
    query_info = opendkim.query_method();
    t.is(query_info, 'DKIM_QUERY_DNS');
  } catch (err) {
    t.fail(err.message);
  }
});

test('throws error on invalid method', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.query_method('DKIM_QUERY_FAKE');
    t.fail();
  } catch (err) {
    t.is(err.message, 'query_method(): invalid method');
  }
});

