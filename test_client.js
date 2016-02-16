var socket = require('socket.io-client')('ws://127.0.0.1:5000');
socket.on('connect', function(){});
socket.on('event', function(data){});
socket.on('disconnect', function(){});
