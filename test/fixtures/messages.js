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

  // message that will fail with bad timestamp data
  this.bad_timestamp = fs.readFileSync(path + 'message_bad_timestamp.eml', 'utf8');

  // message that will fail because of the additional CC header
  this.bad_must_be_signed_list =
    fs.readFileSync(path + 'message_bad_must_me_signed_list.eml', 'utf8');
}

module.exports = Messages;
