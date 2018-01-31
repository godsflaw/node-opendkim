[![Codefresh build status][cf-img]][cf-url]
[![NPM][npm-img]][npm-url]

# node-opendkim

> node.js native language binding to libopendkim

## Install/Test Locally (from source)

```
git clone git@github.com:godsflaw/node-opendkim.git
cd node-opendkim
npm install
npm test -- --verbose

```

## Install Locally (npm)

```
npm install --save node-opendkim
```

## Install Globally (npm)

```
npm install --global node-opendkim
```

## Compile (Development)

```
node-gyp rebuild

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
* [opendkim.lib_feature()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.lib_feature()): Check for supported features.

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
* [opendkim.get_signature()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.get_signature()): sets the signature info handle.
* [opendkim.sig_getidentity()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.sig_getidentity()): get the identity from the signature handle.
* [opendkim.sig_getdomain()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.sig_getdomain()): get the domain from the signature handle.
* [opendkim.sig_geterror()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.sig_geterror()): Retrieve the error code associated with a rejected/disqualified signature.
* [opendkim.sig_geterrorstr()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.sig_geterrorstr()): get the error string specified by the error code.
* [opendkim.sig_getselector()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.sig_getselector()): get the selector from the signature handle.
* [opendkim.get_canonlen()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.get_canonlen()): get the canonicalized message length from the signature handle and message.

## API Utility
* [opendkim.query_info()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.query_info()): get/set query info.
* [opendkim.query_method()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.query_method()): get/set query method.
* [opendkim.tmpdir()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.tmpdir()): get/set tmp dir.

---

## License

MIT © [Christopher Mooney](https://github.com/godsflaw)

[cf-img]: https://g.codefresh.io/api/badges/build?repoOwner=godsflaw&repoName=node-opendkim&branch=dev&pipelineName=node-opendkim&accountName=godsflaw&type=cf-1
[cf-url]: https://g.codefresh.io/repositories/godsflaw/node-opendkim/builds?filter=trigger:build;branch:dev;service:59d2a742525f1c000154fbe8~node-opendkim
[npm-img]: https://nodei.co/npm/node-opendkim.png
[npm-url]: https://www.npmjs.com/package/node-opendkim
