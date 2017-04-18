"use strict";

var fs = require('fs');

function Messages(options) {
  if (false === (this instanceof Messages)) {
   return new Messages(options);
  }

  options = options || {};
  var path = options.path || process.cwd() + '/../fixtures/';

  // good message
  this.good = fs.readFileSync(path + 'message_good.eml', 'utf8');

  // message that will fail with extra signature spaces
  this.bad_extra_signature_spaces =
    fs.readFileSync(path + 'message_bad_extra_signature_spaces.eml', 'utf8');

  // message that will fail with no key error
  this.bad_no_key =
    fs.readFileSync(path + 'message_bad_no_key.eml', 'utf8');

  // message that will fail because of missing signed header
  this.bad_missing_signed_header =
    fs.readFileSync(path + 'message_bad_missing_signed_header.eml', 'utf8');

  // message that will fail with bad timestamp data
  this.bad_timestamp =
    fs.readFileSync(path + 'message_bad_timestamp.eml', 'utf8');

  // message that will fail because of the additional CC header
  this.bad_must_be_signed_list =
    fs.readFileSync(path + 'message_bad_must_me_signed_list.eml', 'utf8');

  // message that will fail with bad future timestamp
  this.bad_timestamp_future =
    fs.readFileSync(path + 'message_bad_timestamp_future.eml', 'utf8');

  // message that will fail with bad negative timestamp (header parse error)
  this.bad_timestamp_negative =
    fs.readFileSync(path + 'message_bad_timestamp_negative.eml', 'utf8');

  // message that will fail with bad bogus timestamp (header parse error)
  this.bad_timestamp_bogus =
    fs.readFileSync(path + 'message_bad_timestamp_bogus.eml', 'utf8');

  // malformed message
  this.bad_malformed =
    fs.readFileSync(path + 'message_bad_malformed.eml', 'utf8');

  // message with bad canonicalization
  this.bad_canonicalization =
    fs.readFileSync(path + 'message_bad_canonicalization.eml', 'utf8');
}

module.exports = Messages;
