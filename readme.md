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

- [OpenDKIM.new()](https://github.com/godsflaw/node-opendkim/wiki/OpenDKIM.new())
- [opendkim.flush_cache()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.flush_cache())

## API Signing Methods

- [opendkim.sign()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.sign())

## API Verifying Methods

- [opendkim.verify()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.verify())

## API Processing Methods

- [opendkim.header()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.header())
- [opendkim.eoh()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.eoh())
- [opendkim.body()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.body())
- [opendkim.eom()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.eom())
- [opendkim.chunk()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.chunk())
- [opendkim.chunk_end()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.chunk_end())

## API Utility Methods

- [opendkim.query_info()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.query_info())
- [opendkim.query_method()](https://github.com/godsflaw/node-opendkim/wiki/opendkim.query_method())

---

## License

MIT © [Christopher Mooney](https://github.com/godsflaw)
