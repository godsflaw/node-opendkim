#!/usr/bin/env node
'use strict';
var meow = require('meow');
var openDKIM = require('./');

var cli = meow([
  'Usage',
  '  $ node-opendkim [input]',
  '',
  'Options',
  '  --foo  Lorem ipsum. [Default: false]',
  '',
  'Examples',
  '  $ node-opendkim',
  '  unicorns & rainbows',
  '  $ node-opendkim ponies',
  '  ponies & rainbows'
]);

console.log(openDKIM(cli.input[0] || 'unicorns'));
