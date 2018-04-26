var util = require('./utils.js');

module.exports = {
	get_device_by_token
};

function get_device_by_token (token) {
	return device_objects[util.find_index(device_objects, 'token', token)];
}
