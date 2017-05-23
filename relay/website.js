var database = require('./database.js');
var utils = require('../utils.js');
var crypto = require('crypto');
var express = require('express');
var url = require('url');
var fs = require('fs');
var https = require('https');
var app = express();
var router = express.Router();

module.exports = {
 start: start
}
function start(app,server,port) {

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
    var index = utils.find_index(accounts,'username',username);
    if (index < 0) return console.log("account not found",username);
    var token = crypto.createHash('sha512').update(password + accounts[index].salt).digest('hex');
    if (token != accounts[index].token) return console.log("passwords do not match");
    return done(null, {token:token, user:username});
  }
));

app.set('view engine', 'ejs');

console.log("__dirname", __dirname);
app.set('views', __dirname + '/views');
app.use('/', express.static(__dirname + '/public'));


app.get('/', function (req, res) {
  //res.sendFile(__dirname + '/index.html');
  res.render('pages/index')
});


app.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    console.log("authenticated",req.user);
    res.json(req.user);
  });

app.post('/register', function(req, res) {
  var username = req.body.username;
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

app.get('/home', function(req, res) {
    res.render('pages/home');
});

app.get('/get_ip', function(req, res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  ip = ip.split(":");
  ip = ip[ip.length - 1];
  console.log(ip);
  res.send(ip);
});


var port = 80;
var index = process.argv.indexOf('-p');
if (index > -1) port = process.argv[index+1];


var secure_port = 443;
var index = process.argv.indexOf('-sp');
if (index > -1) secure_port = process.argv[index+1];

use_ssl = false;
var index = process.argv.indexOf('--use_ssl');
if (index > -1) use_ssl = true;

// Reroute Client request to SSL
if (use_ssl) {
  app.all('*', securedirect);
  function securedirect(req, res, next){
    if(req.secure){
      return next();
  }
      res.redirect('https://'+ req.headers.host + req.url);
  }
}

// Self Signed CA reads for SSL traffic

var options = {
  key: fs.readFileSync(__dirname + '/private.key'),
  cert: fs.readFileSync(__dirname + '/certificate.pem'),
  ca: fs.readFileSync(__dirname + '/chain.pem')
};

if (use_ssl) {
  //var secure_port = 443;
  var secure_server = https.createServer(options, app);
  secure_server.listen(secure_port);
  console.log('Secure Server listening on port ' + secure_port);
}

server.listen(port);
console.log('Insecure Server listening on port ' + port);



///////////////////////End of Code. Do not write below this line.
}



