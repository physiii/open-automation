co-multiparty
=============

co-multiparty is a [co](https://github.com/visionmedia/co) wrapper of [multiparty](https://github.com/andrewrk/node-multiparty)

### Usage
```
npm install co-multiparty
```

```javascript
var formParser = require('co-multiparty');

co(function * () {
  var data = yield formParser.parse(req);
  /*
    data => {
      fields: {...},
      filestreams: [...]
    }
  */
})();
```

## Lisence
MIT