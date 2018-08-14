const config = require('../config.json'),
	https = require('https'),
	http = require('http'),
	TAG = '[http-server.js]';

module.exports = (website, key, cert) => {
	let server;

	if (config.use_ssl) {
		server = https.createServer({key, cert}, website);
	} else {
		server = http.createServer(website);
	}

	server.listen(
		config.use_ssl ? config.website_secure_port : config.website_port,
		null,
		() => console.log(TAG, (config.use_ssl ? 'Secure' : 'Insecure') + ' server listening on port ' + server.address().port + '.')
	);

	return server;
};
