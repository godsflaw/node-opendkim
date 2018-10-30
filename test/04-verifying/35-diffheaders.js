import test from 'ava';
import {iterate} from 'leakage';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test diffheaders missing maxcost', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    await opendkim.verify({id: undefined});
    await opendkim.chunk({
      message: messages.good_z,
      length: messages.good_z.length
    });
    await opendkim.chunk_end();
    opendkim.diffheaders();
    t.fail();
  } catch (err) {
    t.is(err.message, 'diffheaders(): Argument should be an object');
  }
});

test('test diffheaders incorrect maxcost (cannot be 0)', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');
    await opendkim.verify({id: undefined});
    await opendkim.chunk({
      message: messages.good_z,
      length: messages.good_z.length
    });
    await opendkim.chunk_end();
    opendkim.diffheaders({
      maxcost: 0
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'diffheaders(): Invalid maxcost cannot be 0');
  }
});

test('test diffheaders return values', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    await opendkim.verify({id: undefined});
    await opendkim.chunk({
      message: messages.good_z,
      length: messages.good_z.length
    });
    await opendkim.chunk_end();
    var diffResult = opendkim.diffheaders({
      maxcost: 10
    });
    t.is(diffResult.length, 2);
    t.is(diffResult[0].hd_old, 'Received: received data 2');
    t.is(diffResult[0].hd_new, 'Received: received data 1');
    t.is(diffResult[1].hd_old, 'Received: received data 1');
    t.is(diffResult[1].hd_new, 'Received: received data 2');
  } catch (err) {
    console.log(err);
    t.fail();
  }
});


test('test diffheaders return values when header modifed', async t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');
    await opendkim.verify({id: undefined});
    var header = 'Received: received data 3';
    await opendkim.header({
      header: header,
      length: header.length
    });
    await opendkim.chunk({
      message: messages.good_z,
      length: messages.good_z.length
    });
    await opendkim.chunk_end();
    var diffResult = opendkim.diffheaders({
      maxcost: 10
    });
    t.is(diffResult.length, 4);
    t.is(diffResult[0].hd_old, 'Received: received data 1');
    t.is(diffResult[0].hd_new, 'Received: received data 3');
    t.is(diffResult[1].hd_old, 'Received: received data 2');
    t.is(diffResult[1].hd_new, 'Received: received data 3');
    t.is(diffResult[2].hd_old, 'Received: received data 2');
    t.is(diffResult[2].hd_new, 'Received: received data 1');
    t.is(diffResult[3].hd_old, 'Received: received data 1');
    t.is(diffResult[3].hd_new, 'Received: received data 2');
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('test diffheaders return values adding From header field', async t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');
    await opendkim.verify({id: undefined});
    var header = 'From: Murray S. Kucherawy <yo@mismo.com>';
    await opendkim.header({
      header: header,
      length: header.length
    });
    header = 'Received: received data 3';
    await opendkim.header({
      header: header,
      length: header.length
    });
    await opendkim.chunk({
      message: messages.good_z,
      length: messages.good_z.length
    });
    await opendkim.chunk_end();
    var diffResult = opendkim.diffheaders({
      maxcost: 20
    });
    t.is(diffResult.length, 5);
    t.is(diffResult[0].hd_old, 'From: Murray S. Kucherawy <msk@sendmail.com>');
    t.is(diffResult[0].hd_new, 'From: Murray S. Kucherawy <yo@mismo.com>');
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('Memory Leak Test For DiffHeaders Variable', async t => {
  try {
    return iterate.async(async () => {
      var opendkim = new OpenDKIM();
      opendkim.query_method('DKIM_QUERY_FILE');
      opendkim.query_info('../fixtures/testkeys');
      await opendkim.verify({id: undefined});
      var header = 'From: Murray S. Kucherawy <yo@mismo.com>';
      await opendkim.header({
        header: header,
        length: header.length
      });
      for (var i = 0; i < 3; i++) {
        header = 'Received: received data ' + i;
        await opendkim.header({
          header: header,
          length: header.length
        });
      }
      await opendkim.chunk({
        message: messages.good_z,
        length: messages.good_z.length
      });
      await opendkim.chunk_end();
      opendkim.diffheaders({
        maxcost: 10
      });
    }, {iterations: 10, gcollections: 6})
    .then(result => {
      result.printSummary('async diff headers function');
    });
  } catch (err) {
    console.log(err);
    t.fail();
  }
});


