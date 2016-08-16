# node-opendkim [![Build Status](https://travis-ci.org/godsflaw/node-opendkim.svg?branch=master)](https://travis-ci.org/godsflaw/node-opendkim) [![Coverage Status](https://coveralls.io/repos/github/godsflaw/node-opendkim/badge.svg?branch=master)](https://coveralls.io/github/godsflaw/node-opendkim?branch=master)

> node.js native language binding to libopendkim


## Install

```
$ npm install --save node-opendkim
```

## Install Globally

```
$ npm install --global node-opendkim
```

---

## Usage

```js
const OpenDKIM = require('node-opendkim');

var opendkim = new OpenDKIM();
```

---

## API Administration Methods

---

### SYNOPSIS `new`

```js
try {
  var opendkim = new OpenDKIM();
} catch (err) {
  console.log(err);
}
```

Create a new instantiation of the DKIM service, for signing or verifying
Internet messages.

#### DESCRIPTION

new OpenDKIM() is called when setting up the application.

#### ARGUMENTS

Type: `undefined`

#### NOTES

Under the hood, a handle is stored for use with this object instance.  The
handle stored by this function is passed to `dkim.sign()` and `dkim.verify()`.

#### RETURN VALUES

- On success, an empty object is returned
- On failure, it throws an exception.

---

### SYNOPSIS `flush_cache`

```js
try {
  var opendkim = new OpenDKIM();
  // TODO(godsflaw): fill this out so that it uses a cache
  opendkim.flush_cache();
} catch (err) {
  console.log(err);
}
```

Create a new instantiation of the DKIM service, for signing or verifying
Internet messages.

#### DESCRIPTION

`opendkim.flush_cache()` can be called at any time.

For more information:
http://www.opendkim.org/libopendkim/dkim_flush_cache.html

#### ARGUMENTS

Type: `undefined`

#### NOTES

TODO(godsflaw): fix this note, once we have `DKIM_LIBFLAGS_CACHE` nailed down.
- Caching is selected by setting the DKIM_LIBFLAGS_CACHE flag using the
`dkim_options()` method.
- Caching requires a special compile-time option since
it also adds a library dependency to applications.

#### RETURN VALUES

- `-1` if caching is not active for this library instance.
- Number of records flushed if caching is active.

---

## API Signing Methods

---

### SYNOPSIS `sign`

```js
try {
  var opendkim = new OpenDKIM();
  opendkim.sign({
    id: undefined,          // optional (default: undefined)
    secretkey: 'testkey',
    selector: 'a1b2c3',
    domain: 'example.com',
    hdrcanon: 'relaxed',
    bodycanon: 'relaxed',
    signalg: 'sha256',
    signalg: 'sha256',
    length: -1              // optional (default: -1)
  });
} catch (err) {
  console.log(err);
}
```

Create a new context for signing a message.

#### DESCRIPTION

`opendkim.sign()` is called when preparing to process a new message that will
be signed later by a private key.

For more information:
http://www.opendkim.org/libopendkim/dkim_sign.html

#### ARGUMENTS

Type: `Object`

- `id`: `(default: undefined)` An opaque, printable string for identifying this
    message, suitable for use in logging or debug output.
- `secretkey`: The private key to be used when signing this message. This must
    be a string containing either a PEM-formatted private key, or a
    DER-formatted private key after being encoded with base64.
- `selector`: The name of the selector to be reported in the signature on this
    message.
- `domain`: The domain doing the signing; this will be the domain whose DNS will
    be queried by the verifier for key data.
- `hdrcanon`: `(values: 'simple | relaxed')` `(default: 'simple')` The
    canonicalization algorithm to use when preparing the headers of this message
    for signing.
- `bodycanon`: `(values: 'simple | relaxed')` `(default: 'simple')` The
    canonicalization algorithm to use when preparing the body of this message
    for signing.
- `signalg`: `(values: 'sha1 | sha256')` `(default: 'sha1')` The signing algorithm
    to use when generating the signature to be attached to this message.
- `length`: `(default: -1)` The number of bytes of the body to sign. A value
    of -1 will cause the entire message to be signed.


#### NOTES

- DKIM_STAT_INVALID is thrown if, for example, a signing handle using 'sha256'
    is requested when the library was not compiled against a version of OpenSSL
    that had support for that hash algorithm.
- The context for signing is now stored -- under the hood -- with the opendkim
    instance.

#### RETURN VALUES

- On failure, an exception is thrown that indicates the cause of the problem.

---

## License

MIT © [Christopher Mooney](https://github.com/godsflaw/node-opendkim)
