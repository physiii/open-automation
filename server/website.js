// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// ---------------------------------- website.js -------------------------------------- //

var database = require('./database.js');
var utils = require('./utils.js');
var crypto = require('crypto');
var express = require('express');
var socket = require('./socket.js');
var bodyParser = require('body-parser');
var url = require('url');
var fs = require('fs');
var https = require('https');
var http = require('http');
var Webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var webpack_config = require('../webpack.config');

module.exports = {
	start: start
}

function start (app) {
	var website_port = config.website_port || 5000;
	var website_secure_port = config.website_secure_port || 4443;
	var use_ssl = config.use_ssl || false;
	var use_domain_ssl = config.use_domain_ssl || false;
	var use_dev = config.use_dev || false;
	var key_path = use_dev ? __dirname + '/key.pem' : '/etc/letsencrypt/live/pyfi.org/privkey.pem',
		cert_path = use_dev ? __dirname + '/cert.pem' : '/etc/letsencrypt/live/pyfi.org/fullchain.pem',
		options = {
			key: fs.readFileSync(key_path),
			cert: fs.readFileSync(cert_path)
		},
		port,
		server,
		socket_server,
		server_description;

	// Create servers
	if (use_dev && !use_ssl && !use_domain_ssl) { // Create Webpack dev server
		var compiler = Webpack(webpack_config);
		var dev_server_options = Object.assign({}, webpack_config.devServer, {
			contentBase: __dirname + '/../public',
			port: website_port,
			stats: {
				colors: true
			}
		});

		port = website_port;
		server = new WebpackDevServer(compiler, dev_server_options);
		socket_server = server.listeningApp;
		app = server.app;
		server_description = 'Webpack dev';
	} else if (use_ssl || use_domain_ssl) { // Create secure server
		port = website_secure_port;
		server = https.createServer(options, app);
		socket_server = server;
		server_description = 'Secure';
	} else { // Create insecure server
		port = website_port;
		server = http.createServer(app);
		socket_server = server;
		server_description = 'Insecure';
	}

	app.use(bodyParser.json()); // support json encoded bodies
	app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
	var allowCrossDomain = function (req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
		if ('OPTIONS' == req.method) {
			res.send(200);
		} else {
			next();
		}
	};
	app.use(allowCrossDomain);

	var passport = require('passport'),
		LocalStrategy = require('passport-local').Strategy;

	app.use(passport.initialize());
	app.use(passport.session());
	passport.serializeUser(function (user, done) {
		done(null, user);
	});

	passport.use(new LocalStrategy(
		function(username, password, done) {
			username = username.toLowerCase();
			var index = utils.find_index(accounts,'username',username);
			if (index < 0) return console.log("account not found",username);
			var token = crypto.createHash('sha512').update(password + accounts[index].salt).digest('hex');
			if (token != accounts[index].token) return console.log("passwords do not match");
			return done(null, {token:token, user:username});
		}
	));

	// app.set('view engine', 'ejs');
	// app.set('views', __dirname + '/views');
	app.use('/', express.static(__dirname + '/../public'));

	app.get('/', function (req, res) {
		res.sendFile('index.html');
	});

	// app.post('/login',
	// 	passport.authenticate('local'),
	// 	function(req, res) {
	// 		console.log("authenticated",req.user);
	// 		res.json(req.user);
	// 	});

	// app.post('/register', function(req, res) {
	// 	var username = req.body.username.toLowerCase();
	// 	var index = utils.find_index(accounts,'username',username);
	// 	if (index < 0) {
	// 		var account_obj = {username:username};
	// 		account_obj.salt = Math.random().toString(36).substring(7);
	// 		var token = crypto.createHash('sha512').update(req.body.password + account_obj.salt).digest('hex');
	// 		account_obj.token = token;
	// 		account_obj.timestamp = Date.now();
	// 		database.store_account(account_obj);
	// 		accounts.push(account_obj);
	// 	} else {
	// 		res.json({error:"account already exists"});
	// 		return console.log("account already exist!");
	// 	}
		
	// 	var index = utils.find_index(groups,'group_id',username);
	// 	if (index < 0) {
	// 		var group = {group_id:username, mode:'init', user:username, device_type:['alarm'], contacts:[], members:[username]};    
	// 		database.store_group(group);
	// 	} else {
	// 		res.json({error:"group already exists"});
	// 		return console.log("group already exist!");
	// 	}
		
	// 	var result = {username:username, token:token};
	// 	res.json(result);
	// 	console.log("registered account",account_obj);
	// });

	app.get('/get_ip', function(req, res) {
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		ip = ip.split(":");
		ip = ip[ip.length - 1];
		res.send(ip);
	});

	// Start servers
	server.listen(port, null, () => console.log(server_description + ' server listening on port ' + port));
	socket.start(socket_server);
}
