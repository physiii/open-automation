// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// ---------------------------------- socket.js -------------------------------------- //

const database = require('./database.js'),
	devices = require('./devices/devices-manager.js'),
	utils = require('./utils.js'),
	crypto = require('crypto'),
	nodemailer = require('nodemailer'),
	smtpTransport = require('nodemailer-smtp-transport'),
	find_index = utils.find_index,
	TAG = '[socket.js]';

let motionStarted = false;

module.exports = {
	start: start
};

devices.loadDevicesFromDb();

var transporter = nodemailer.createTransport(
	smtpTransport({
		service: config.mail.service,
		auth: {
			user: config.mail.from_user,
			pass: config.mail.password
		}
	})
);

function start (server) {
	var io = require('socket.io').listen(server);

	io.on('connection', function (socket) {
		console.info(TAG, socket.id + ' | client connected');

		// Gateway device connection
		socket.on('gateway/device/connect', (data, callback) => {
			const device = devices.getDeviceById(data.device_id);

			// If the device doesn't exist, store the socket in escrow to be used
			// when the device is added.
			if (!device) {
				devices.addToSocketEscrow(data.device_id, socket);

				if (typeof callback === 'function') {
					callback(null, {});
				}

				return;
			}

			// TODO: Add some sort of authentication so we know this is really the device it claims to be.

			// Update the socket on the device.
			device.setGatewaySocket(socket);

			if (typeof callback === 'function') {
				callback(null, {});
			}
		});


		// Client API

		socket.on('devices/get', (data, callback) => {
			if (typeof callback === 'function') {
				const locationDevices = devices.getDevicesByLocation(data.user_token);

				callback(null, {devices: devices.getClientSerializedDevices(locationDevices)});
			}
		});

    socket.on('camera/recordings/get', function (data, callback) {
    	if (typeof callback === 'function') {
	    	const cameraService = devices.getServiceById(data.service_id);

	    	cameraService.getRecordings().then((recordings) => {
	    		callback(null, {recordings: recordings});
	    	}).catch((error) => {
	    		callback(error);
	    	});
	    }
    });





		socket.on('link user', function (data, callback) {
			//console.log('!! LINK USER !!',data);
			var index = find_index(user_objects, 'socket', socket);
			//if (index < 0) {
			user_objects.push({
				user: data.user,
				token: data.user_token,
				socket: socket
			});
			console.log('link user', data.user)
			//} else {

			console.log('socket already exists');
			//}

			if (typeof callback === 'function') {
				callback(null, data.user);
			}
		});







		//---------- motion ---------//
		socket.on('motion detected', function (data) {
			console.log('motion detected', data.toString());
			if (!motionStarted) {
				motionStarted = true;
				var mailOptions = {
					from: config.mail.from_user,
					to: config.mail.to_user,
					subject: 'Motion Detected',
					text: data.toString()
				};
				transporter.sendMail(mailOptions, function (error, info) {
					if (error) {
						console.log(error);
					} else {
						console.log('Email sent: ' + info.response);
					}
				});
			}
		});
		socket.on('motion stopped', function (data) {
			console.log('motion stopped', data.toString());
			if (motionStarted) {
				motionStarted = false;
				var mailOptions = {
					from: config.mail.from_user,
					to: config.mail.to_user,
					subject: 'Motion Stopped',
					text: data.toString()
				};
				transporter.sendMail(mailOptions, function (error, info) {
					if (error) {
						console.log(error);
					} else {
						console.log('Email sent: ' + info.response);
					}
				});
			}
		});

		socket.on('get contacts', function (data) {
			var group_index = find_index(groups, 'group_id', data.user_token);
			socket.emit('get contacts', groups[group_index]);
			//console.log('get contacts',data);
		});

		socket.on('add contact', function (data) {
			var group_index = find_index(groups, 'group_id', data.user_token);
			groups[group_index].contacts.push({ label: data.label, number: data.number });
			database.store_group(groups[group_index]);
			socket.emit('add contact', data);
		});

		socket.on('remove contact', function (data) {
			var group_index = find_index(groups, 'group_id', data.user_token);
			var user_index = groups[group_index].contacts.indexOf(data.user);
			for (var i = 0; i < groups[group_index].contacts.length; i++) {
				if (groups[group_index].contacts[i].label === data.user.label) {
					user_index = i;
				}
			}
			groups[group_index].contacts.splice(user_index, 1);
			database.store_group(groups[group_index]);
			socket.emit('remove contact', data);
		});



		socket.on('login', function (data) {
			var public_ip = socket.request.connection.remoteAddress;
			public_ip = public_ip.slice(7);
			var username = data.username;
			var password = data.password;
			delete data.password;
			var mac = data.mac;
			var name = data.name;
			var index = find_index(accounts, 'username', username);
			if (index < 0) return console.log('login | account not found', username);
			var user_token = crypto.createHash('sha512').update(password + accounts[index].salt).digest('hex');
			if (user_token != accounts[index].token) return console.log('login | passwords do not match');
			var token = crypto.createHash('sha512').update(mac).digest('hex');
			//var salt = data.salt //some random value
			data.public_ip = public_ip;
			data.token = token;
			data.user_token = user_token;
			socket.emit('login', data);
			delete data.username;
			delete data.user_token;
			console.log('login |', data);
			var device_index = find_index(device_objects, 'token', token);
			if (device_index > -1) {
				database.store_device_object(data);
				device_objects[device_index].socket = socket;
				console.log('updated device', mac);
			} else {
				data.groups = [mac];
				database.store_device_object(data);
				data.socket = socket;
				device_objects.push(data);
				console.log('added device', mac);
			}

			var index = find_index(groups, 'group_id', username);
			if (index < 0) {
				var group = { group_id: username, mode: 'init', type: ['alarm'], members: [username] };
				groups.push(group);
				database.store_group(group);
			}

		});

		socket.on('link device', function (data) {
			var username = data.username;
			var name = data.name;
			var user_token = data.user_token;
			var token = crypto.createHash('sha512').update(data.mac).digest('hex');
			if (data.type == 'lights') return console.log('trying to link lights?');

			var device_index = find_index(device_objects, 'token', token);
			if (device_index < 0) return console.log('link device | device not found', token);
			//device_objects[device_index].socket.emit('rename device', {name:name,token:token})
			var mac = device_objects[device_index].mac;
			var user_index = find_index(accounts, 'token', user_token);
			if (!accounts[user_index]) return console.log('link device | no account found');
			var username = accounts[user_index].username;

			//add user to device for incoming messages
			if (device_objects[device_index].groups.indexOf(username) < 0) {
				device_objects[device_index].groups.push(username);
				device_objects[device_index].name = name;
				database.store_device_object(device_objects[device_index]);
			} //else return console.log('link device | no device found');

			//add device to user group
			var group_index = find_index(groups, 'group_id', username);
			if (!groups[group_index]) return console.log('link device | no user group found ', groups);
			if (groups[group_index].members.indexOf(mac) < 0) {
				groups[group_index].members.push(mac);
				database.store_group(groups[group_index]);
			}

			//add user to device group
			var group_index = find_index(groups, 'group_id', mac);
			if (group_index < 0) {
				console.log('link device | group_id not found', mac);
				var new_group = { 'group_id': mac, members: [mac, username] };
				database.store_group(new_group);
			}
			else if (groups[group_index].members.indexOf(username) < 0) {
				groups[group_index].members.push(username);
				database.store_group(groups[group_index]);
			}
			data.res = 'success';
			if (data.username == 'Please enter a username') return console.log('link device | unregistered device');
			//var temp_object = Object.assign({}, {});
			var temp_object = Object.assign({}, device_objects[device_index]);
			/*temp_object.mac = device_objects[device_index].mac;
			temp_object.public_ip = device_objects[device_index].public_ip;
			temp_object.type = device_objects[device_index].type;
			temp_object.groups = device_objects[device_index].groups;
			temp_object.token = device_objects[device_index].token;*/

			delete temp_object.socket;
			delete temp_object.wsButtons;
			delete temp_object.wsTokens;
			delete temp_object.wsClimate;
			delete temp_object.wsPower;
			console.log(TAG, 'link device', temp_object);
			socket.emit('link device', temp_object);
			//get_devices(data,socket);
		});

		socket.on('unlink device', function (data) {
			var device_token = data.token;
			var user_token = data.user_token;

			var account_index = find_index(accounts, 'token', user_token);
			if (account_index < 0) return console.log('unlink device | account not found');

			var device_index = find_index(device_objects, 'token', device_token);
			if (device_index < 0) return console.log('unlink device | no device found', data);

			var group_index = find_index(groups, 'group_id', accounts[account_index].username);
			if (group_index < 0) return console.log('unlink device | no group found', data);

			var member_index = groups[group_index].members.indexOf(device_objects[device_index].mac);
			groups[group_index].members.splice(member_index, 1);
			database.store_group(groups[group_index]);
			console.log('unlink device', groups[group_index]);

			var user_index = device_objects[device_index].groups.indexOf(accounts[account_index].username);
			device_objects[device_index].groups.splice(user_index, 1);
			database.store_device_object(device_objects[device_index]);
			socket.emit('unlink device', data);
		});






		socket.on('disconnect', function () {
			console.info(socket.id + ' | client disconnected');
			var index = find_index(device_objects, 'socket', socket);

			if (index < 0) {
				return;
			}

			var device = device_objects[index];
			for (var j = 0; j < device.groups.length; j++) {
				//message group members
				var group_index = find_index(groups, 'group_id', device.groups[j]);
				var group = groups[group_index];
				if (!group.contacts) continue;
				for (var k = 0; k < group.contacts.length; k++) {
					var contactNumber = group.contacts[k].number;
					if (contactNumber) {
						var message = device.type+' '+device.mac+' disconnected';
						sendMessage(contactNumber, 'Disconnected', message);
					}
				}
			}


			if (index > -1) device_objects.splice(index, 1);
		});
	});
}
