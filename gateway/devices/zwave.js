// -----------------------------  OPEN-AUTOMATION ------------------------- //
// ------------  https://github.com/physiii/open-automation --------------- //
// --------------------------------- zwave.js ----------------------------- //

var socket = require('../socket.js');
var os = require('os');

module.exports = {
  add_node: add_node,
  remove_node: remove_node,
  hard_reset: hard_reset,
  set_value: set_value
}

//function start() {

var nodes = [];
var OpenZWave = require('openzwave-shared');
var zwave = new OpenZWave({
	ConsoleOutput: false,
	Logging: false,
	SaveConfiguration: false,
	DriverMaxAttempts: 3,
	PollInterval: 500,
	SuppressValueRefresh: true,
	NetworkKey: "0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0A,0x0B,0x0C,0x0D,0x0E,0x0F,0x10"
});

setTimeout(function () {
  //hard_reset();
  //remove_node();
}, 30*1000);

function set_value(nodeid, commandclass, index, value) {
  zwave.setValue(nodeid, commandclass, index, value);
}

function add_node(secure) {
  zwave.addNode();
}

function remove_node() {
  console.log("remove node...");
  zwave.removeNode();
}

function hard_reset() {
  console.log("hard reset...");
  zwave.hardReset();
}

//function init_zwave() {
zwave.on('connected', function(homeid) {
	//console.log('=================== CONNECTED! ====================');
});

zwave.on('driver ready', function(homeid) {
	console.log('=================== DRIVER READY! ====================');
	console.log('scanning homeid=0x%s...', homeid.toString(16));
//console.log("adding node");
//zwave.addNode(1);
});

zwave.on('driver failed', function() {
	console.log('failed to start driver');
	//zwave.disconnect();
	//process.exit();
});

zwave.on('node added', function(nodeid) {
	console.log('=================== NODE ADDED! ====================',nodeid);
	nodes[nodeid] = {
		manufacturer: '',
		manufacturerid: '',
		product: '',
		producttype: '',
		productid: '',
		type: '',
		name: '',
		loc: '',
		classes: {},
		ready: false,
	};
});

zwave.on('value added', function(nodeid, comclass, value) {
  if (!nodes[nodeid]['classes'][comclass])
    nodes[nodeid]['classes'][comclass] = {};
  nodes[nodeid]['classes'][comclass][value.index] = value;
});

zwave.on('value changed', function(nodeid, comclass, value) {

  if (nodes[nodeid]['ready']) {
    console.log('node%d: changed: %d:%s:%s->%s', nodeid, comclass,
      value['label'],
      nodes[nodeid]['classes'][comclass][value.index]['value'],
      value['value']);
   
    console.log("value changed",nodes[nodeid].product);
    database.store_device(nodes[nodeid]);
  }
  nodes[nodeid]['classes'][comclass][value.index] = value;
});

zwave.on('value removed', function(nodeid, comclass, index) {
	if (nodes[nodeid]['classes'][comclass] &&
	    nodes[nodeid]['classes'][comclass][index])
		delete nodes[nodeid]['classes'][comclass][index];
});
zwave.on('node ready', function(nodeid, nodeinfo) {
	nodes[nodeid]['manufacturer'] = nodeinfo.manufacturer;
	nodes[nodeid]['manufacturerid'] = nodeinfo.manufacturerid;
	nodes[nodeid]['product'] = nodeinfo.product;
	nodes[nodeid]['producttype'] = nodeinfo.producttype;
	nodes[nodeid]['productid'] = nodeinfo.productid;
	nodes[nodeid]['type'] = nodeinfo.type;
	nodes[nodeid]['name'] = nodeinfo.name;
	nodes[nodeid]['loc'] = nodeinfo.loc;
	nodes[nodeid]['ready'] = true;
	nodes[nodeid]['id'] = nodeid;
	nodes[nodeid]['device_type'] = nodeinfo.type;
	nodes[nodeid]['local_ip'] = connection.local_ip;

	console.log('node%d: %s, %s', nodeid,
		    nodeinfo.manufacturer ? nodeinfo.manufacturer
					  : 'id=' + nodeinfo.manufacturerid,
		    nodeinfo.product ? nodeinfo.product
				     : 'product=' + nodeinfo.productid +
				       ', type=' + nodeinfo.producttype);
	console.log('node%d: name="%s", type="%s", location="%s"', nodeid,
		    nodeinfo.name,
		    nodeinfo.type,
		    nodeinfo.loc);
   	database.store_device(nodes[nodeid]);
	for (var comclass in nodes[nodeid]['classes']) {
		switch (comclass) {
		case 0x25: // COMMAND_CLASS_SWITCH_BINARY
		case 0x26: // COMMAND_CLASS_SWITCH_MULTILEVEL
			zwave.enablePoll(nodeid, comclass);
			break;
		}
		var values = nodes[nodeid]['classes'][comclass];
		console.log('node%d: class %d', nodeid, comclass);
		for (var idx in values)
			console.log('node%d:   %s=%s', nodeid, values[idx]['label'], values[idx]['value']);
	}
});

zwave.on('notification', function(nodeid, notif, help) {
	console.log('node%d: notification(%d): %s', nodeid, notif, help);
});

zwave.on('scan complete', function() {
	console.log('zwave scan complete');
});

var zwavedriverpaths = {
	"darwin" : '/dev/cu.usbmodem1411',
	"linux"  : '/dev/ttyUSB0',
	"windows": '\\\\.\\COM3'
}
console.log("connecting to " + zwavedriverpaths[os.platform()]);
zwave.connect( zwavedriverpaths[os.platform()] );

process.on('SIGINT', function() {
	console.log('disconnecting...');
	zwave.disconnect();
	process.exit();
});
//}

//}
