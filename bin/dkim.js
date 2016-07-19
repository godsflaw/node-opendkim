var OpenDKIM = require('../build/Release/opendkim').OpenDKIM;

var dkim = new OpenDKIM();
var dkim2 = new OpenDKIM();

console.log(dkim);
console.log(dkim2);

console.log(dkim.pow(4, 2));
