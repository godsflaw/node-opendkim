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

## Usage

```js
const OpenDKIM = require('node-opendkim');

var opendkim = new OpenDKIM();
```


## API


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


## License

MIT © [Christopher Mooney](https://github.com/godsflaw/node-opendkim)
