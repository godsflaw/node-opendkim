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

  // good message with z=
  this.good_z = fs.readFileSync(path + 'message_good_z.eml', 'utf8');

  // good message, no signature
  this.no_signature = fs.readFileSync(path + 'message_no_signature.eml', 'utf8');

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

  // message with bad header canonicalization
  this.bad_header_canonicalization =
    fs.readFileSync(path + 'message_bad_header_canonicalization.eml', 'utf8');

  // message with bad body canonicalization
  this.bad_body_canonicalization =
    fs.readFileSync(path + 'message_bad_body_canonicalization.eml', 'utf8');

  // message with bad sigalg
  this.bad_sigalg =
    fs.readFileSync(path + 'message_bad_sigalg.eml', 'utf8');

  // message with missing bh tag
  this.bad_missing_bh_tag =
    fs.readFileSync(path + 'message_bad_missing_bh_tag.eml', 'utf8');

  // message with bogus from header
  this.bad_bogus_from =
    fs.readFileSync(path + 'message_bad_bogus_from.eml', 'utf8');

  // message with missing from header
  this.bad_missing_from =
    fs.readFileSync(path + 'message_bad_missing_from.eml', 'utf8');

  // message with altered body
  this.bad_altered_body =
    fs.readFileSync(path + 'message_bad_altered_body.eml', 'utf8');

  // message with malformed signature
  this.bad_malformed_signature =
    fs.readFileSync(path + 'message_bad_malformed_signature.eml', 'utf8');

  // message with mismatched i= and d=
  this.bad_mismatched_i_d =
    fs.readFileSync(path + 'message_bad_mismatched_i_d.eml', 'utf8');

  // message with missing h=
  this.bad_missing_h_signature =
    fs.readFileSync(path + 'message_bad_missing_h_signature.eml', 'utf8');

  // message with h= lacking required headers
  this.bad_lacking_h =
    fs.readFileSync(path + 'message_bad_lacking_h.eml', 'utf8');

  // message with oversized l=
  this.bad_oversized_l =
    fs.readFileSync(path + 'message_bad_oversized_l.eml', 'utf8');

  // message with a bad signature version
  this.bad_signature_version =
    fs.readFileSync(path + 'message_bad_signature_version.eml', 'utf8');

  // message with empty timestamp
  this.bad_timestamp_empty =
    fs.readFileSync(path + 'message_bad_timestamp_empty.eml', 'utf8');
}

module.exports = Messages;
