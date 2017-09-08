var multiparty = require('multiparty');

exports.parse = function(req) {
  return function(cb) {
    var fields = {};
    var parts = [];
    var form = new multiparty.Form();
    form.on('field', function(name, value) {
      fields[name] = value;
    });
    form.on('part', function(part) {
      if (!part.filename) return;
      parts.push(part);
    });
    form.on('close', function() {
      cb(null, {
        fields: fields,
        filestreams: parts
      });
    });
    form.on('error', function(err){
      cb(err);
    });
    form.parse(req);
  }
}