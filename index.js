'use strict';

var OpenDKIM = require('./build/Release/opendkim').OpenDKIM;


// Administration methods
OpenDKIM.prototype.flush_cache = function (callback) {
  var self = this;

  if (arguments.length === 1 && typeof callback === 'function') {
    // errback
    this.native_flush_cache(callback);
  } else {
    // Promise
    return new Promise(function (resolve, reject) {
      self.native_flush_cache(function (err, result) {
        /* istanbul ignore if */
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
};

OpenDKIM.prototype.flush_cache_sync = function () {
  return this.native_flush_cache_sync();
};

OpenDKIM.prototype.lib_feature = function (feature) {
  return this.native_lib_feature({feature: feature});
};


// Processing methods
OpenDKIM.prototype.header = function (obj, callback) {
  var self = this;

  if (arguments.length === 0) {
    throw new Error('header(): Wrong number of arguments');
  }

  // added for the poor folks that call this as an errback without a try/catch
  if (arguments.length === 1 && typeof obj === 'function') {
    return obj(new Error('header(obj, func): Wrong number of arguments'));
  }

  if (arguments.length === 2) {
    // errback
    this.native_header(obj, callback);
  } else {
    // Promise
    return new Promise(function (resolve, reject) {
      self.native_header(obj, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
};

OpenDKIM.prototype.header_sync = function (obj) {
  return this.native_header_sync(obj);
};

OpenDKIM.prototype.eoh = function (callback) {
  var self = this;

  if (arguments.length === 1 && typeof callback === 'function') {
    // errback
    this.native_eoh(callback);
  } else {
    // Promise
    return new Promise(function (resolve, reject) {
      self.native_eoh(function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
};

OpenDKIM.prototype.eoh_sync = function () {
  return this.native_eoh_sync();
};

OpenDKIM.prototype.body = function (obj, callback) {
  var self = this;

  if (arguments.length === 0) {
    throw new Error('body(): Wrong number of arguments');
  }

  // added for the poor folks that call this as an errback without a try/catch
  if (arguments.length === 1 && typeof obj === 'function') {
    return obj(new Error('body(obj, func): Wrong number of arguments'));
  }

  if (arguments.length === 2) {
    // errback
    this.native_body(obj, callback);
  } else {
    // Promise
    return new Promise(function (resolve, reject) {
      self.native_body(obj, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
};

OpenDKIM.prototype.body_sync = function (obj) {
  return this.native_body_sync(obj);
};

OpenDKIM.prototype.eom = function (obj, callback) {
  var self = this;

  if (obj === undefined) {
    obj = {testkey: false};
  }

  // added for the poor folks that call this as an errback without a try/catch
  if (arguments.length === 1 && typeof obj === 'function') {
    callback = obj;
    obj = {testkey: false};
  }

  if (typeof callback === 'function') {
    // errback
    this.native_eom(obj, callback);
  } else {
    // Promise
    return new Promise(function (resolve, reject) {
      self.native_eom(obj, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
};

OpenDKIM.prototype.eom_sync = function (obj) {
  if (obj === undefined) {
    obj = {testkey: false};
  }

  return this.native_eom_sync(obj);
};

OpenDKIM.prototype.chunk = function (obj, callback) {
  var self = this;

  if (arguments.length === 0) {
    throw new Error('chunk(): Wrong number of arguments');
  }

  // added for the poor folks that call this as an errback without a try/catch
  if (arguments.length === 1 && typeof obj === 'function') {
    return obj(new Error('chunk(obj, func): Wrong number of arguments'));
  }

  if (arguments.length === 2) {
    // errback
    this.native_chunk(obj, callback);
  } else {
    // Promise
    return new Promise(function (resolve, reject) {
      self.native_chunk(obj, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
};

OpenDKIM.prototype.chunk_sync = function (obj) {
  return this.native_chunk_sync(obj);
};

OpenDKIM.prototype.chunk_end = function (callback) {
  var self = this;

  if (arguments.length === 1 && typeof callback === 'function') {
    // errback
    this.native_chunk_end(callback);
  } else {
    // Promise
    return new Promise(function (resolve, reject) {
      self.native_chunk_end(function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
};

OpenDKIM.prototype.chunk_end_sync = function () {
  return this.native_chunk_end_sync();
};


// Sign methods
OpenDKIM.prototype.sign = function (obj, callback) {
  var self = this;

  if (arguments.length === 0) {
    throw new Error('sign(): Wrong number of arguments');
  }

  // added for the poor folks that call this as an errback without a try/catch
  if (arguments.length === 1 && typeof obj === 'function') {
    return obj(new Error('sign(obj, func): Wrong number of arguments'));
  }

  if (arguments.length === 2) {
    // errback
    this.native_sign(obj, callback);
  } else {
    // Promise
    return new Promise(function (resolve, reject) {
      self.native_sign(obj, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
};

OpenDKIM.prototype.sign_sync = function (obj) {
  if (arguments.length === 0) {
    throw new Error('sign(): Wrong number of arguments');
  }

  return this.native_sign_sync(obj);
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
OpenDKIM.prototype.get_signature = function () {
  return this.native_get_signature();
};

OpenDKIM.prototype.ohdrs = function (obj) {
  return this.native_ohdrs(obj);
};

OpenDKIM.prototype.sig_getcanonlen = function () {
  return this.native_sig_getcanonlen();
};

OpenDKIM.prototype.sig_getdomain = function () {
  return this.native_sig_getdomain();
};

OpenDKIM.prototype.sig_geterror = function () {
  return this.native_sig_geterror();
};

OpenDKIM.prototype.sig_geterrorstr = function (code) {
  return this.native_sig_geterrorstr(code);
};

OpenDKIM.prototype.sig_getidentity = function () {
  return this.native_sig_getidentity();
};

OpenDKIM.prototype.sig_getselector = function () {
  return this.native_sig_getselector();
};

OpenDKIM.prototype.verify = function (obj, callback) {
  var self = this;

  if (arguments.length === 0) {
    throw new Error('verify(): Wrong number of arguments');
  }

  // added for the poor folks that call this as an errback without a try/catch
  if (arguments.length === 1 && typeof obj === 'function') {
    return obj(new Error('verify(obj, func): Wrong number of arguments'));
  }

  if (arguments.length === 2) {
    // errback
    this.native_verify(obj, callback);
  } else {
    // Promise
    return new Promise(function (resolve, reject) {
      self.native_verify(obj, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
};

OpenDKIM.prototype.verify_sync = function (obj) {
  if (arguments.length === 0) {
    throw new Error('verify(): Wrong number of arguments');
  }

  return this.native_verify_sync(obj);
};

module.exports = OpenDKIM;
