'use strict';

import test from 'ava';

var OpenDKIM = require('../../');

test('test with no argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.get_option();
    t.fail();
  } catch (err) {
    t.is(err.message, 'get_option(): Argument should be an object');
  }
});

test('test with numeric argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.get_option(1);
    t.fail();
  } catch (err) {
    t.is(err.message, 'get_option(): Argument should be an object');
  }
});

test('test with string argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.get_option('test');
    t.fail();
  } catch (err) {
    t.is(err.message, 'get_option(): Argument should be an object');
  }
});

test('test with missing option arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.get_option({
      // nothing
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'get_option(): option is undefined');
  }
});

test('test with invalid option', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.get_option({
      option: 'DKIM_OPTS_FAKE'
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'get_option(): invalid option');
  }
});

// This is just one test to make sure the function works.  There is
// no need to write more like this, because each option is tested
// when testing the specific functions for those options.  The tests
// that cover the this can be found in 03-utility/02-query-method.js.
// Please follow that format to test options.
test('check default for DKIM_OPTS_QUERYMETHOD', t => {
  try {
    var opendkim = new OpenDKIM();
    var query_info = opendkim.get_option({option: 'DKIM_OPTS_QUERYMETHOD'});
    t.is(query_info, 'DKIM_QUERY_DNS');
  } catch (err) {
    t.fail(err.message);
  }
});
