const https = require('https'),
	http = require('http'),
	TAG = '[http-server.js]';

module.exports = (website, key, cert) => {
	let server;

	if (process.env.OA_SSL) {
		server = https.createServer({key, cert}, website);
	} else {
		server = http.createServer(website);
	}

	server.listen(
		process.env.OA_WEBSITE_PORT,
		null,
		() => console.log(TAG, (process.env.OA_SSL ? 'Secure' : 'Insecure') + ' server listening on port ' + server.address().port + '.')
	);

	return server;
};
