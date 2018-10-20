## DESCRIPTION
Attempts to discern how signed header fields were changed in transit in order to debug verification problems.
`dkim_diffheaders()` can be called at any time after end-of-headers processing (i.e. `dkim_eoh()`) while verifying.

## ARGUMENTS

Type: `Object`
- `maxcost`: The maxcost field being input, including its name, value and separating colon (":") character.

When comparing two header fields, a "cost" is computed for each difference observed. The library computes the cost of a match by computing the number of character insertions, removals or replacements that would be needed to transition from the first header field to the second; insertions and removals each have a cost of 1 and replacements a cost of 2. Two header fields are considered a match for the purposes of this function if the cost of a comparison is below the value of maxcost. Thus, larger values are more prone to mismatches, but smaller values might not detect serious munging of headers in transit. Insertions and removals are given lower costs because it is presumed most munging in transit changes spaces, but doesn't actually rewrite other content.

Example: 

```js
{
  "maxcost": 10 // max cost 
}
```



## RETURN VALUES
* On failure, an exception is thrown that indicates the cause of the problem.
* Returns an array of objects. Each object contains an hd_old field that refers to the original signed header, and one called hd_new that refers to its corresponding value in the received message.
* Example:
```js
{
  "hd_old": "Received: data 1",
  "hd_new": "Received: data 2"
},
{
  "hd_old": "Received: data 3",
  "hd_new": "Received: data 4"
},
...

```

## NOTES
* throws an error if there is simply no signature on the message.

## EXAMPLE (async/await)                                                                                 
                                                                                                         
```js                                                                                                    
const OpenDKIM = require('node-opendkim');                                                               
                                                                                                         
async function diff_async(message) {                                                                         
  var opendkim = new OpenDKIM();                                                                         
                                                                                                         
  try {                                                                                                  
    await opendkim.verify({id: undefined});                                                              
    await opendkim.chunk({                                                                               
      message: message,                                                                                  
      length: message.length                                                                             
    });                                                                                                  
    await opendkim.chunk_end();                                                                          
    var diffResult = opendkim.diffheaders({
      maxcost: 10
    });                                                           
    console.log(diffResult);                                                                                             
  } catch (err) {                                                                                                                             
    console.log(err);                                                                                    
  }                                                                                                      
}                                                                                                        
```                                                                                                      
                                                                                                         
## EXAMPLE (sync)                                                                                        
                                                                                                         
```js                                                                                                    
const OpenDKIM = require('node-opendkim');                                                               
                                                                                                         
function diff_sync(message) {                                                                          
  var opendkim = new OpenDKIM();                                                                         
                                                                                                         
  try {                                                                                                  
    opendkim.verify_sync({id: undefined});                                                               
    opendkim.chunk_sync({                                                                                
      message: message,                                                                                  
      length: message.length                                                                             
    });                                                                                                  
    opendkim.chunk_end_sync();                                                                           
    var diffResult = opendkim.diffheaders({
      maxcost: 10
    });                         
    console.log(diffResult);                                            
  } catch (err) {                                  
    console.log(err);                                                                                    
  }                                                                                                      
}                                                                                                        
```
## EXAMPLE (errback)                                                                                     
                                                                                                         
```js                                                                                                    
const OpenDKIM = require('node-opendkim');                                                               
                                                                                                         
function diff(opendkim, message, callback) {                                                                                                      
  opendkim.verify({id: undefined}, function (err, result) {                                              
    if (err) {                                                                                           
      return callback(err, result);                                                                      
    }                                                                                                    
                                                                                                         
    var options = {                                                                                      
      message: message,                                                                                  
      length: message.length                                                                             
    };                                                                                                   
                                                                                                         
    opendkim.chunk(options, function (err, result) {                                                     
      if (err) {                                                                                         
        return callback(err, result);                                                                    
      }                                                                                                  
                                                                                                         
      opendkim.chunk_end(function (err, result) {                                                        
        if (err) {                                                                                       
          return callback(err, result);                                                                  
        }                                                                                                
                                                                                                         
        var diffResult = opendkim.diffheaders({
          maxcost: 10
        });                                                       
                                                                                                         
        return callback(err, diffResult);                                                                  
      });                                                                                                
    });                                                                                                  
  });                                                                                                    
}
                                                                                                        
var opendkim = new OpenDKIM();

diff(opendkim, message, function (err, diffResult) {                                                               
  if (err) {                                                                                             
    return console.log(err);                                                                                              
  }                                                                                                      
                                                                                                         
  // success                                                                                             
  console.log(diffResult);                                            
});

