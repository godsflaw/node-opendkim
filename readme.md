# node-opendkim [![Build Status](https://travis-ci.org/godsflaw/node-opendkim.svg?branch=master)](https://travis-ci.org/godsflaw/node-opendkim) [![Coverage Status](https://coveralls.io/repos/github/godsflaw/node-opendkim/badge.svg?branch=master)](https://coveralls.io/github/godsflaw/node-opendkim?branch=master)

> node.js native language binding to libopendkim


## Install/Test (locally)

```
git clone git@github.com:godsflaw/node-opendkim.git
cd node-opendkim
npm install
npm test -- --verbose

```

## Install/Test (npm)

```
npm install --save node-opendkim
```

## Install Globally (npm)

```
npm install --global node-opendkim
```

## Compile (Development)

```
node-gyp clean ; node-gyp configure ; node-gyp build

```

---

## Usage

### Verify

```js
const OpenDKIM = require('node-opendkim');

try {
  var opendkim = new OpenDKIM();
  opendkim.verify({
    id: undefined // optional (default: undefined)
  });

  // Adding one header at a time, when finished call opendkim.eoh()
  var header = 'From: <herp@derp.com>';
  opendkim.header({
      header: header,
      length: header.length
  });
  opendkim.eoh();

  // Adding body chunks, when finished call opendkim.eom().  This too
  // can take many chunks.  Do NOT include the terminating DOT.
 var body = 'this is a test';
  opendkim.body({
      body: body,
      length: body.length
  });
  // This does the final validation, and will throw an error if there is one.
  opendkim.eom();
} catch (err) {
  console.log(err);
}
```

---

## API Administration
* [OpenDKIM.new()](https://github.com/godsflaw/node-opendkim/wiki/OpenDKIM.new()): new instance of OpenDKIM object.
* [opendkim.flush_cache()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.flush_cache()): Flush the key cache.

## API Processing
* [opendkim.header()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.header()): Process a header.
* [opendkim.eoh()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.eoh()): Identify end of headers.
* [opendkim.body()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.body()): Process a body chunk.
* [opendkim.eom()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.eom()): Identify end of message.
* [opendkim.chunk()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.chunk()): Process a message chunk.
* [opendkim.chunk_end()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.chunk_end()): called when done with chunk.

## API Signing
* [opendkim.sign()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.sign()): get ready to sign a message.

## API Verifying
* [opendkim.verify()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.verify()): get ready to verify a message.


## API Utility
* [opendkim.query_info()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.query_info()): get/set query info.
* [opendkim.query_method()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.query_method()): get/set query method.
* [opendkim.tmpdir()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.tmpdir()): get/set tmp dir.

---

## License

MIT © [Christopher Mooney](https://github.com/godsflaw)
