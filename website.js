// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// ---------------------------------- website.js -------------------------------------- //

var database = require('./database.js');
var utils = require('./utils.js');
var crypto = require('crypto');
var express = require('express');
var socket = require('./socket.js');
var url = require('url');
var fs = require('fs');
var https = require('https');
var http = require('http');
var app = express();
var router = express.Router();
var TAG = "[website.js]";

module.exports = {
 start: start
}

function start(app) {

// ------------- //
// SSL Redirect  //
// ------------- //
/*
if (config.use_ssl || config.use_domain_ssl){
  app.get('*', securedirect);

  function securedirect(req, res, next){
    if(req.secure){
      return next();
  }
  var parts = req.headers.host.split(":");
  var ssl_url = parts[0] + ":" + config.website_secure_port;
  res.redirect('https://'+ ssl_url + req.url);
 }
}
*/

var port = config.website_port || 5000;
var secure_port = config.website_secure_port || 4443;
var use_ssl = config.use_ssl || false;
var use_domain_ssl = config.use_domain_ssl || false;
var use_dev = config.use_dev || false;

if(use_dev){
var options = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
  };
} else {
var options = {
    key: fs.readFileSync('/etc/letsencrypt/live/pyfi.org/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/pyfi.org/fullchain.pem'),
  };
}

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};
app.use(allowCrossDomain);

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
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

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use('/', express.static(__dirname + '/public'));


app.get('/', function (req, res) {
  //res.sendFile(__dirname + '/index.html');
  res.render('pages/index')
});

app.post('/testing', function(req, res) {
  console.log("testtttting!!!");
});

app.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    console.log("authenticated",req.user);
    res.json(req.user);
  });

app.post('/register', function(req, res) {
  var username = req.body.username.toLowerCase();
  var index = utils.find_index(accounts,'username',username);
  if (index < 0) {
    var account_obj = {username:username};
    account_obj.salt = Math.random().toString(36).substring(7);
    var token = crypto.createHash('sha512').update(req.body.password + account_obj.salt).digest('hex');
    account_obj.token = token;
    account_obj.timestamp = Date.now();
    database.store_account(account_obj);
    accounts.push(account_obj);
  } else {
    res.json({error:"account already exists"});
    return console.log("account already exist!");
  }
  
  var index = utils.find_index(groups,'group_id',username);
  if (index < 0) {
    var group = {group_id:username, mode:'init', user:username, device_type:['alarm'], contacts:[], members:[username]};    
    database.store_group(group);
  } else {
    res.json({error:"group already exists"});
    return console.log("group already exist!");
  }
  
  var result = {username:username, token:token};
  res.json(result);
  console.log("registered account",account_obj);
});

app.get('/remote_site_monitoring', function(req, res) {
  res.render('pages/remote_site_monitoring');
});

app.get('/home_automation_security', function(req, res) {
  res.render('pages/home_automation_security');
});

app.get('/home', function(req, res) {
  res.render('pages/home');
});


app.get('/demo', function(req, res) {
  var path = __dirname + '/public/test.html';
  console.log(TAG,path);
  //res.sendFile(path);
  //res.sendFile(__dirname + '/test.html');
  //res.render('public/test.html');
});

app.get('/test', function(req, res) {
  var path = __dirname + '/public/test.html';
  console.log(TAG,path);
  //res.sendFile(path);
  //res.sendFile(__dirname + '/test.html');
  //res.render('public/test.html');
});

app.get('/get_ip', function(req, res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  ip = ip.split(":");
  ip = ip[ip.length - 1];
  res.send(ip);
});



// Create and start servers

// Self Signed CA reads for SSL traffic

if (use_ssl || use_domain_ssl) {
  var secure_server = https.createServer(options, app);
  secure_server.listen(config.website_secure_port);
  console.log('Secure Server listening on port ' + secure_port);
} else {
  var server = http.createServer(app);
  server.listen(port);
  console.log('Insecure Server listening on port ' + port);
}


if (use_ssl || use_domain_ssl){
  console.log(TAG + "Hit secure Port")
  socket.start(secure_server);
} else {
  socket.start(server);
}

///////////////////////End of Code. Do not write below this line.
}

