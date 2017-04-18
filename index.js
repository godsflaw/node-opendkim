'use strict';

var OpenDKIM = require('./build/Release/opendkim').OpenDKIM;

OpenDKIM.prototype.query_info = function (data) {
  if (data === undefined) {
    return this.get_option({option: 'DKIM_OPTS_QUERYINFO'});
  }

  if (data.length < 1) {
    throw new Error('query_info(): data is empty');
  }

  this.set_option({
    option: 'DKIM_OPTS_QUERYINFO',
    data: data,
    length: data.length
  });
};

OpenDKIM.prototype.query_method = function (data) {
  if (data === undefined) {
    return this.get_option({option: 'DKIM_OPTS_QUERYMETHOD'});
  }

  if (data !== 'DKIM_QUERY_DNS' && data !== 'DKIM_QUERY_FILE') {
    throw new Error('query_method(): invalid method');
  }

  this.set_option({
    option: 'DKIM_OPTS_QUERYMETHOD',
    data: data,
    length: data.length
  });
};

OpenDKIM.prototype.tmpdir = function (data) {
  if (data === undefined) {
    return this.get_option({option: 'DKIM_OPTS_TMPDIR'});
  }

  if (data.length < 1) {
    throw new Error('tmpdir(): data is empty');
  }

  this.set_option({
    option: 'DKIM_OPTS_TMPDIR',
    data: data,
    length: data.length
  });
};

module.exports = OpenDKIM;
