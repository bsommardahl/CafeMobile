var nodeStatic = require('node-static');
var file = new nodeStatic.Server('./www');
var port = process.env.PORT || 3000;
console.log("Starting cafe mobile static server...");
require('http').createServer(function(request, response) {
  request.addListener('end', function() {
    file.serve(request, response);
  }).resume();  
}).listen(port);
console.log("Listening on port " + port + ".");