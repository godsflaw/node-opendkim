"use strict";

var fs = require('fs');

function Messages(options) {
  if (false === (this instanceof Messages)) {
   return new Messages(options);
  }

  options = options || {};
  var path = options.path || process.cwd() + '/../fixtures/';

  this.good = fs.readFileSync(path + 'message_good.data', 'utf8');
}

module.exports = Messages;
