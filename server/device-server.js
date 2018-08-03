const WebSocketServer = require('ws').Server;

module.exports = function (server) {
	const socketServer = io.listen(server);
	console.log(TAG, 'Websocket device server initialized');



	function onConnection (callback) {
		socketServer.on('upgrade', (request, socket, head) => {
			const pathname = url.parse(request.url).pathname;

			switch (pathname){
				case '/tokens':
					break
				case '/buttons':
					break;
				case '/power':
					break;
				case '/LED':
					break;
				case '/microphone':
					break;
				case '/motion':
					break;
				case '/climate':
					break;
				case '/update':
					break;
				default:
					socket.destroy();
					break;
			}
		});
	}
}


/*
const wssTokens = new WebSocketServer({ noServer: true });
const wssButtons = new WebSocketServer({ noServer: true });
const wssPower = new WebSocketServer({ noServer: true });
const wssLED = new WebSocketServer({ noServer: true });
const wssMicrophone = new WebSocketServer({ noServer: true });
const wssMotion = new WebSocketServer({ noServer: true });
const wssUpdate = new WebSocketServer({ noServer: true });
const wssClimate = new WebSocketServer({ noServer: true });

wssTokens.handleUpgrade(request, socket, head, (ws) => {
      wssTokens.emit('connection', ws);

if (pathname === '/tokens') {
	wssTokens.handleUpgrade(request, socket, head, (ws) => {
		wssTokens.emit('connection', ws);
	});
} else if (pathname === '/buttons') {
	wssButtons.handleUpgrade(request, socket, head, (ws) => {
		wssButtons.emit('connection', ws);
	});
} else if (pathname === '/power') {
	wssPower.handleUpgrade(request, socket, head, (ws) => {
		wssPower.emit('connection', ws);
	});
} else if (pathname === '/LED') {
	wssLED.handleUpgrade(request, socket, head, (ws) => {
		wssLED.emit('connection', ws);
	});
} else if (pathname === '/microphone') {
	wssMicrophone.handleUpgrade(request, socket, head, (ws) => {
		wssMicrophone.emit('connection', ws);
	});
} else if (pathname === '/motion') {
	wssMotion.handleUpgrade(request, socket, head, (ws) => {
		wssMotion.emit('connection', ws);
	});
} else if (pathname === '/climate') {
	wssClimate.handleUpgrade(request, socket, head, (ws) => {
		wssClimate.emit('connection', ws);
	});
} else if (pathname === '/update') {
	wssUpdate.handleUpgrade(request, socket, head, (ws) => {
		wssUpdate.emit('connection', ws);
	});
} else {
	socket.destroy();
}
});

wssUpdate.on('connection', function connection(ws) {
console.log(TAG, "<< ---- incoming update connection ---- >>");
ws.on('message', function incoming(message) {
	console.log("<< ---- incoming update message ---- >>\n", message);
	var msg = {};
	try { msg = JSON.parse(message) }
	catch (e) { console.log("invalid json", message) };
	var token = msg.token;
	var mac = msg.mac;
	var cmd = msg.cmd;
	var type = msg.type;
	var local_ip = msg.local_ip;
	var value = msg.value;
	var public_ip = ws.upgradeReq.connection.remoteAddress;
	var device_index = find_index(device_objects, 'token', token);
	//if (device_index < 0)
	if (!type) return;
	var device_index = find_index(device_objects, 'token', token);
	if (!device_objects[device_index]) return console.log("device not found", token);
	var group_index = find_index(groups, 'group_id', device_objects[device_index].mac);
	if (group_index < 0) return console.log("group_id not found", data.mac);
	// --------------  respond to token requests  ----------------- //
	if (cmd == "link") {
		device_objects[device_index].wsUpdate = ws;
		try { ws.send("linked") }
		catch (e) { console.log("reply error | " + e) };
		console.log('updated update socket', device_objects[device_index].mac);
	}

	// --------------  send buttons to clients --------------- //
	if (cmd == "update") {
		try { ws.send("sending update") }
		catch (e) { console.log("reply error | " + e) };
		console.log('sent buttons to clients', device_objects[device_index].mac);
	}

});
});

wssClimate.on('connection', function connection(ws) {
console.log(TAG, "<< ---- incoming climate connection ---- >>");
ws.on('message', function incoming(message) {
	//console.log("<< ---- incoming climate message ---- >>\n",message);
	var msg = {};
	try { msg = JSON.parse(message) }
	catch (e) { console.log("invalid json", message) };
	var token = msg.token;
	var mac = msg.mac;
	var cmd = msg.cmd;
	var type = msg.type;
	var local_ip = msg.local_ip;
	var value = msg.value;
	var public_ip = ws.upgradeReq.connection.remoteAddress;
	var device_index = find_index(device_objects, 'token', token);
	//if (device_index < 0)
	if (!type) return;
	var device_index = find_index(device_objects, 'token', token);
	if (!device_objects[device_index]) return console.log("device not found", token);
	var group_index = find_index(groups, 'group_id', device_objects[device_index].mac);
	if (group_index < 0) return console.log("group_id not found", data.mac);
	// --------------  respond to token requests  ----------------- //
	if (cmd == "link") {
		device_objects[device_index].wsPower = ws;
		var link_obj = {};
		link_obj.linked = 1;
		try { ws.send(JSON.stringify(link_obj)) }
		catch (e) { console.log("reply error | " + e) };
		console.log((Date.now() - start_time) / 1000, 'linked climate socket', device_objects[device_index].mac);
	}

	// --------------  send buttons to clients --------------- //
	if (cmd == "climate") {
		for (var i = 0; i < groups[group_index].members.length; i++) {
			//console.log("sending buttons to ",groups[group_index].members[i]);
			//msg.message = "temperature: " + value;
			message_user(groups[group_index].members[i], 'regulator climate', msg);
		}

		try { ws.send(JSON.stringify({ "result": "sent" })) }
		catch (e) { console.log("reply error | " + e) };
		console.log((Date.now() - start_time) / 1000, 'sent climate to clients', device_objects[device_index].mac);
	}
});
});

wssPower.on('connection', function connection(ws) {
console.log(TAG, "<< ---- incoming power connection ---- >>");
ws.on('message', function incoming(message) {
	//console.log("<< ---- incoming power message ---- >>\n",message);
	var msg = {};
	try { msg = JSON.parse(message) }
	catch (e) { console.log("invalid json", message) };
	var token = msg.token;
	var mac = msg.mac;
	var cmd = msg.cmd;
	var type = msg.type;
	if (!type) return;
	var local_ip = msg.local_ip;
	var value = msg.value;
	var public_ip = ws.upgradeReq.connection.remoteAddress;
	var device_index = find_index(device_objects, 'token', token);
	if (!device_objects[device_index]) return console.log("device not found", token);
	device_objects[device_index].wsPower = ws;
	var group_index = find_index(groups, 'group_id', device_objects[device_index].mac);
	if (group_index < 0) return console.log("group_id not found", data.mac);
	// --------------  respond to token requests  ----------------- //
	if (cmd == "link") {
		device_objects[device_index].wsPower = ws;
		var link_obj = {};
		link_obj.linked = 1;
		try { ws.send(JSON.stringify(link_obj)) }
		catch (e) { console.log("reply error | " + e) };
		console.log((Date.now() - start_time) / 1000, 'linked power socket', device_objects[device_index].mac);
	}

	// --------------  send buttons to clients --------------- //
	if (cmd == "power") {
		for (var i = 0; i < groups[group_index].members.length; i++) {
			//console.log("sending power to ",groups[group_index].members[i]);
			//msg.message = "main_voltage: " + value;
			message_user(groups[group_index].members[i], 'regulator power', msg);
		}
		//try { device_objects[device_index].wsPower.send("sent power to clients") }
		try { ws.send(JSON.stringify({ "result": "sent" })) }
		catch (e) { console.log("reply error | " + e) };
		console.log((Date.now() - start_time) / 1000, 'sent power to clients', device_objects[device_index].mac);
	}
});
});


wssLED.on('connection', function connection(ws) {
console.log(TAG, "<< ---- incoming LED connection ---- >>");
ws.on('message', function incoming(message) {
	console.log("<< ---- incoming LED message ---- >>\n", message);
	var msg = {};
	try { msg = JSON.parse(message) }
	catch (e) { console.log("invalid json", message) };
	var token = msg.token;
	var mac = msg.mac;
	var cmd = msg.cmd;
	var type = msg.type;
	var local_ip = msg.local_ip;
	var value = msg.value;
	var public_ip = ws.upgradeReq.connection.remoteAddress;
	var device_index = find_index(device_objects, 'token', token);
	//if (device_index < 0)
	if (!type) return;
	var device_index = find_index(device_objects, 'token', token);
	if (!device_objects[device_index]) return console.log("device not found", token);
	var group_index = find_index(groups, 'group_id', device_objects[device_index].mac);
	if (group_index < 0) return console.log("group_id not found", data.mac);
	// --------------  respond to token requests  ----------------- //
	if (cmd == "link") {
		device_objects[device_index].wsLED = ws;
		//try { ws.send("linked") }
		try { ws.send(JSON.stringify({ "linked": 1 })) }
		catch (e) { console.log("reply error | " + e) };
		console.log('updated LED socket', device_objects[device_index].mac);
	}

	// --------------  send buttons to clients --------------- //
	if (cmd == "LED") {
		for (var i = 0; i < groups[group_index].members.length; i++) {
			//console.log("sending buttons to ",groups[group_index].members[i]);
			msg.message = "LED! " + value;
			message_user(groups[group_index].members[i], 'room_sensor', msg);
		}

		try { ws.send("sent to LED clients") }
		catch (e) { console.log("reply error | " + e) };
		console.log('sent LED to clients', device_objects[device_index].mac);
	}

});
});

wssButtons.on('connection', function connection(ws) {
console.log(TAG, "<< ---- incoming buttons connection ---- >>");
ws.on('message', function incoming(message) {
	console.log("<< ---- incoming buttons message ---- >>\n", message);
	var msg = {};
	try { msg = JSON.parse(message) }
	catch (e) { console.log("invalid json", message) };
	var token = msg.token;
	var mac = msg.mac;
	var cmd = msg.cmd;
	var type = msg.type;
	var local_ip = msg.local_ip;
	var value = msg.value;
	var public_ip = ws.upgradeReq.connection.remoteAddress;
	var device_index = find_index(device_objects, 'token', token);
	//if (device_index < 0)
	if (!type) return;
	var device_index = find_index(device_objects, 'token', token);
	if (!device_objects[device_index]) return console.log("device not found", token);
	var group_index = find_index(groups, 'group_id', device_objects[device_index].mac);
	if (group_index < 0) return console.log("group_id not found", data.mac);
	// --------------  respond to token requests  ----------------- //
	if (cmd == "link") {
		device_objects[device_index].wsButtons = ws;
		try { ws.send("linked") }
		catch (e) { console.log("reply error | " + e) };
		console.log('updated buttons socket', device_objects[device_index].mac);
	}

	// --------------  send buttons to clients --------------- //
	if (cmd == "buttons") {
		for (var i = 0; i < groups[group_index].members.length; i++) {
			//console.log("sending buttons to ",groups[group_index].members[i]);
			msg.message = "Button Pressed! " + value;
			message_user(groups[group_index].members[i], 'room_sensor', msg);
		}

		try { ws.send("sent to buttons clients") }
		catch (e) { console.log("reply error | " + e) };
		console.log('sent buttons to clients', device_objects[device_index].mac);
	}

});
});

wssMicrophone.on('connection', function connection(ws) {
console.log(TAG, "<< ---- incoming microphone connection ---- >>");
ws.on('message', function incoming(message) {
	console.log("<< ---- incoming microphone message ---- >>\n", message);
	var msg = {};
	try { msg = JSON.parse(message) }
	catch (e) { console.log("invalid json", message) };
	var token = msg.token;
	var mac = msg.mac;
	var cmd = msg.cmd;
	var value = msg.value;
	var type = msg.type;
	var local_ip = msg.local_ip;
	var public_ip = ws.upgradeReq.connection.remoteAddress;
	var device_index = find_index(device_objects, 'token', token);
	//if (device_index < 0)
	if (!type) return;
	var device_index = find_index(device_objects, 'token', token);
	if (!device_objects[device_index]) return console.log("device not found", token);
	// --------------  respond to token requests  ----------------- //
	if (cmd == "link") {
		device_objects[device_index].wsMicrophone = ws;
		try { ws.send("linked") }
		catch (e) { console.log("reply error | " + e) };
		console.log('updated microphone socket', device_objects[device_index].mac);
	}
});
});

/* DELETE wssMotion.on('connection', function connection(ws) {
console.log(TAG,"<< ---- incoming motion connection ---- >>");
ws.on('message', function incoming(message) {
	//console.log("<< ---- incoming motion message ---- >>\n",message);
	var msg = {};
	try { msg = JSON.parse(message) }
	catch (e) { console.log("invalid json", message) };
	var token = msg.token;
	var mac = msg.mac;
	var cmd = msg.cmd;
	var value = msg.value;
	var type = msg.type;
	var local_ip = msg.local_ip;
	var public_ip = ws.upgradeReq.connection.remoteAddress;
	var device_index = find_index(device_objects,'token',token);
	if (device_index < 0) return console.log("device not found", mac);
	if (!type) return;
	var device_index = find_index(device_objects,'token',token);
	if (!device_objects[device_index]) return console.log("device not found", token);
	var group_index = find_index(groups,'group_id',device_objects[device_index].mac);
	if (group_index < 0) return console.log("group_id not found", data.mac);
	// --------------  respond to token requests  ----------------- //
	if (cmd == "link") {
		device_objects[device_index].wsMotion = ws;
		try { ws.send("linked") }
		catch (e) { console.log("reply error | " + e) };
		console.log('updated motion socket',device_objects[device_index].mac);
	}
	// --------------  send motion to clients --------------- //
	if (cmd == "motion") {
		for (var i=0; i < groups[group_index].members.length; i++) {
			//console.log("sending motion to ",groups[group_index].members[i]);
msg.message = "Motion Detected!";
			message_user(groups[group_index].members[i],'room_sensor',msg);
		}
		//try { ws.send("sent to motion clients") }
		//catch (e) { console.log("reply error | " + e) };
		//console.log('sent motion to clients',device_objects[device_index].mac);
	}
});
});

/*wssClimate.on('connection', function connection(ws) {
console.log(TAG,"<< ---- incoming climate connection ---- >>");
ws.on('message', function incoming(message) {
	console.log("<< ---- incoming climate message ---- >>\n",message);
	var msg = {};
	try { msg = JSON.parse(message) }
	catch (e) { console.log("invalid json", message) };
	var token = msg.token;
	var mac = msg.mac;
	var cmd = msg.cmd;
	var value = msg.value;
	var type = msg.type;
	var local_ip = msg.local_ip;
	var public_ip = ws.upgradeReq.connection.remoteAddress;
	var device_index = find_index(device_objects,'token',token);
	if (device_index < 0) return console.log("device not found", mac);
	if (!type) return;
	var device_index = find_index(device_objects,'token',token);
	if (!device_objects[device_index]) return console.log("device not found", token);
	var group_index = find_index(groups,'group_id',device_objects[device_index].mac);
	if (group_index < 0) return console.log("group_id not found", data.mac);
	// --------------  respond to climate requests  ----------------- //
	if (cmd == "link") {
		device_objects[device_index].wsClimate = ws;
		try { ws.send("linked") }
		catch (e) { console.log("reply error | " + e) };
		console.log('updated motion socket',device_objects[device_index].mac);
	}
	// --------------  send climate to clients --------------- //
	if (cmd == "light") {
		for (var i=0; i < groups[group_index].members.length; i++) {
			//console.log("sending motion to ",groups[group_index].members[i]);
msg.message = "light level";
			message_user(groups[group_index].members[i],'room_sensor',msg);
		}
		//try { ws.send("sent to motion clients") }
		//catch (e) { console.log("reply error | " + e) };
		//console.log('sent motion to clients',device_objects[device_index].mac);
	}
});
});

wssTokens.on('connection', function connection(ws) {
console.log(TAG, "<< ---- incoming tokens connection ---- >>");
ws.on('message', function incoming(message) {
	console.log("<< ---- incoming tokens message ---- >>\n", message);
	var msg = {};
	try { msg = JSON.parse(message) }
	catch (e) { console.log("invalid json", message) };
	var token = msg.token;
	var mac = msg.mac;
	var cmd = msg.cmd;
	var type = msg.type;
	var local_ip = msg.local_ip;
	var public_ip = ws.upgradeReq.connection.remoteAddress;
	var device_index = find_index(device_objects, 'token', token);
	//console.log(TAG, "device_objects ", device_objects);
	if (!type) return;

	// --------------  respond to ping requests  ----------------- //
	if (cmd == "png_test") {
		command = "png_test";
		try { ws.send('command' + command) }
		catch (e) { console.log("reply error | " + e) };
		ping_time = Date.now() - ping_start;
		//console.log(mac + " | received ping, sending reply ");
	}

	// ------------------  send device info  --------------------- //
	if (cmd == "version") {
		if (!device_objects[device_index])
			return;
		for (var j = 0; j < device_objects[device_index].groups.length; j++) {
			message_user(device_objects[device_index].groups[j], 'version', msg);
			var group_index = find_index(groups, 'group_id', device_objects[device_index].groups[j]);
			console.log("media_controller messing users", device_objects[device_index].groups[j]);
			for (var k = 0; k < groups[group_index].members.length; k++) {
				message_device(groups[group_index].members[k], msg);
				message_user(groups[group_index].members[k], 'version', msg);
			}
		}

		console.log("sending version number", msg);
	}

	// --------------  respond to token requests  ----------------- //
	if (cmd == "token_request") {
		var token = crypto.createHash('sha512').update(mac).digest('hex');
		console.log(TAG, (Date.now() - start_time) / 1000, "token_request", token);
		try { ws.send('{\"token\":\"' + token + '\"}') }
		//try { ws.send(token) }
		catch (e) { console.log("reply error | " + e) };
		var device_index = find_index(device_objects, 'mac', mac);
		if (device_index < 0) {
			var device_object = { token: token, mac: mac, local_ip: local_ip, public_ip: public_ip, type: [type], groups: [] };
			database.store_device_object(device_object);
			console.log('added device', device_object.mac);
			device_object.wsTokens = ws;
			device_objects.push(device_object);
		} else {
			device_objects[device_index].token = token;
			device_objects[device_index].public_ip = public_ip;
			device_objects[device_index].local_ip = local_ip;
			device_objects[device_index].type = type;
			//if (device_objects[device_index].wsTokens) delete device_objects[device_index].wsTokens;
			//database.store_device_object(device_objects[device_index]);
			device_objects[device_index].wsTokens = ws;
			//console.log('updated device',device_objects[device_index]);
		}

		var index = find_index(groups, 'group_id', mac);
		if (index < 0) {
			var group = { group_id: mac, mode: 'init', type: [type], members: [mac], IR: [], record_mode: false };
			groups.push(group);
			database.store_group(group);
		}
	}

	// --------------  respond to token requests  ----------------- //
	if (cmd == "buttons") {
		var token = crypto.createHash('sha512').update(mac).digest('hex');
		//try { ws.send('{\"token\":\"'+token+'\"}') }
		var command = "LIGHT1_ON";
		try { ws.send(command) }
		catch (e) { console.log("reply error | " + e) };
	}
	// --------------  respond to OTA requests  ----------------- //
	if (cmd == "init_ota") {
		try { ws.send('{\"cmd\":\"update\",\"token\":\"'+token+'\"}') }
		//try { ws.send("TESTING!!!!") }
		catch (e) { console.log("reply error | " + e) };
		//console.log(TAG,"init_ota")
	}

	// ----------------  garage opener  ------------------- //
	if (type === "garage_opener") { console.log("garage_opener",msg)
	}
	// ---------------  media controller  ----------------- //
	if (type === "media_controller") {
		for (var j = 0; j < device_objects[device_index].groups.length; j++) {
			message_user(device_objects[device_index].groups[j],'media_controller',msg);
			var group_index = find_index(groups,'group_id',device_objects[device_index].groups[j]);
			//console.log("media_controller messing users",device_objects[device_index].groups[j]);
			for (var k=0; k < groups[group_index].members.length; k++) {
				message_device(groups[group_index].members[k],msg);
				message_user(groups[group_index].members[k],'media_controller',msg);
			}
		}
		var index = find_index(groups,'group_id',token);
		if (groups[index].record_mode.value == true) {
			var ir_index = find_index(groups[index].IR,'command',groups[index].record_mode.command);
			if (ir_index > -1) {
				groups[index].IR[ir_index].ir_codes.push(msg.ir_code);
				console.log("pushing onto ir_codes",ir_obj);
			} else {
				var ir_obj =  {command:groups[index].record_mode.command,
					ir_codes:[msg.ir_code]};
				groups[index].IR.push(ir_obj);
				console.log("storing new ir_codes",ir_obj);
			}
			groups[index].record_mode.value = false
			database.store_group(groups[index]);
			console.log("storing code",groups[index]);
		}
		//console.log("media_controller",groups[index]);
	}
	// --------------  room sensor  ----------------- //
	for (var i = 0; i < type.length; i++) {
		if (type[i] === "room_sensor") {
			//console.log("room_sensor",msg);
			//loop through groups for device group
			if (!device_objects[device_index]) return;
			for (var j = 0; j < device_objects[device_index].groups.length; j++) {
				//message group members
				var group_index = find_index(groups,'group_id',device_objects[device_index].groups[j]);
				msg.mode = groups[group_index].mode;
				message_user(device_objects[device_index].groups[j],'room_sensor',msg);
				for (var k=0; k < groups[group_index].members.length; k++) {
					message_device(groups[group_index].members[k],msg);
					message_user(groups[group_index].members[k],'room_sensor',msg);
				}
				if (msg.motion == "Motion Detected" && groups[group_index].mode == "armed") {
					console.log("mode",groups[group_index].mode);
					if (groups[group_index].mode == 'armed') {
						for (var k=0; k < groups[group_index].contacts.length; k++) {
							var contact = {number:groups[group_index].contacts[k].number,user:mac,msg:msg};
							console.log("room_sensor text");
							contact.name = msg.name;
							text(contact);
						}
					}
				}
			}
		}
	}

	// ------------  motion sensor  --------------- //
	for (var i = 0; i < type.length; i++) {
		if (type[i] === "motion_sensor") {
			//loop through groups for device group
			for (var j = 0; j < device_objects[device_index].groups.length; j++) {
				//message group members
				var group_index = find_index(groups,'group_id',device_objects[device_index].groups[j]);
				console.log("group",device_objects[device_index].groups[j]);
				msg.mode = groups[group_index].mode;
				message_user(device_objects[device_index].groups[j],'motion_sensor',msg);
				for (var k=0; k < groups[group_index].members.length; k++) {
					message_device(groups[group_index].members[k],msg);
					message_user(groups[group_index].members[k],'motion_sensor',msg);
				}
				if (groups[group_index].mode == 'armed') {
					for (var k=0; k < groups[group_index].contacts.length; k++) {
						var contact = {number:groups[group_index].contacts[k].number,user:mac,msg:msg};
						console.log("motion_sensor text");
						text(contact);
					}
				}
			}
		}
	}

	// -------- //
});

ws.on('close', function close() {
	for (var i = 0; i < device_objects.length; i++) {
		_socket = device_objects[i].socket;
		_mac = device_objects[i].mac;
		if (_socket === ws) {
			device_objects.slice(i); //slice or splice??
			console.log(_mac + " | disconnected");
		}
	}
});

ws.on('error', function () {
	console.log('device websocket error catch!');
});
});
*/
