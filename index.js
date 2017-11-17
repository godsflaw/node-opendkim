'use strict';

var OpenDKIM = require('./build/Release/opendkim').OpenDKIM;


// Administration methods
OpenDKIM.prototype.flush_cache = function () {
  return this.native_flush_cache();
};

OpenDKIM.prototype.lib_feature = function (feature) {
  return this.native_lib_feature({feature: feature});
};


// Processing methods
OpenDKIM.prototype.header = function (arg) {
  return this.native_header(arg);
};

OpenDKIM.prototype.eoh = function () {
  return this.native_eoh();
};

OpenDKIM.prototype.body = function (arg) {
  return this.native_body(arg);
};

OpenDKIM.prototype.eom = function () {
  return this.native_eom();
};

OpenDKIM.prototype.chunk = function (arg) {
  return this.native_chunk(arg);
};

OpenDKIM.prototype.chunk_end = function () {
  return this.native_chunk_end();
};


// Sign methods
OpenDKIM.prototype.sign = function (obj) {
  return this.native_sign(obj);
};


// Utility methods
OpenDKIM.prototype.get_option = function (opt) {
  return this.native_get_option(opt);
};

OpenDKIM.prototype.set_option = function (opt) {
  return this.native_set_option(opt);
};

OpenDKIM.prototype.query_info = function (data) {
  if (data === undefined) {
    return this.native_get_option({option: 'DKIM_OPTS_QUERYINFO'});
  }

  if (data.length < 1) {
    throw new Error('query_info(): data is empty');
  }

  this.native_set_option({
    option: 'DKIM_OPTS_QUERYINFO',
    data: data,
    length: data.length
  });
};

OpenDKIM.prototype.query_method = function (data) {
  if (data === undefined) {
    return this.native_get_option({option: 'DKIM_OPTS_QUERYMETHOD'});
  }

  if (data !== 'DKIM_QUERY_DNS' && data !== 'DKIM_QUERY_FILE') {
    throw new Error('query_method(): invalid method');
  }

  this.native_set_option({
    option: 'DKIM_OPTS_QUERYMETHOD',
    data: data,
    length: data.length
  });
};

OpenDKIM.prototype.tmpdir = function (data) {
  if (data === undefined) {
    return this.native_get_option({option: 'DKIM_OPTS_TMPDIR'});
  }

  if (data.length < 1) {
    throw new Error('tmpdir(): data is empty');
  }

  this.native_set_option({
    option: 'DKIM_OPTS_TMPDIR',
    data: data,
    length: data.length
  });
};


// Verifying methods
OpenDKIM.prototype.verify = function (obj) {
  return this.native_verify(obj);
};

OpenDKIM.prototype.get_signature = function () {
  return this.native_get_signature();
};

OpenDKIM.prototype.sig_getidentity = function () {
  return this.native_sig_getidentity();
};

OpenDKIM.prototype.sig_getdomain = function () {
  return this.native_sig_getdomain();
};

OpenDKIM.prototype.sig_getselector = function () {
  return this.native_sig_getselector();
};

OpenDKIM.prototype.sig_geterror = function () {
  return this.native_sig_geterror();
};

OpenDKIM.prototype.sig_geterrorstr = function (code) {
  return this.native_sig_geterrorstr(code);
};

module.exports = OpenDKIM;
