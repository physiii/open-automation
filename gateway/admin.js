var express = require('express');
var program_app = express();
var program_port = 3000;
var program_server = program_app.listen(program_port);
var program_io = require('socket.io')(program_server);

program_server.listen(program_port, function () {
  console.log('Admin on port %d', program_port);
});     

program_app.use(express.static(__dirname + '/public'));
program_io.on('connection', function (socket) {
  console.log(socket.id + " connected");
  socket.emit('router_array',router_list);

  socket.on('set wifi', function (data) {
    console.log("set wifi",data);
    store_settings(data);
    set_wifi(data);
    exec("sudo reboot");
  });
});
