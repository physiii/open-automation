/**
*
*/
var os = require("os"),
	spawn = require('child_process').spawn
;
var Me = {
	bin:"php-cgi"
	,env:{
		'SERVER_SOFTWARE':"nodejs"
		,'SERVER_PROTOCOL':"HTTP/1.1"
		,'GATEWAY_INTERFACE':"CGI/1.1"
		,'SERVER_NAME':os.hostname()
		,'REDIRECT_STATUS_ENV':0
	},setEnv:function(env) {
		for(var e in env) {
			Me.env[e] = env[e];
		}
	},newRequestParams:function() {
		var reqEnv = {};
		for(var keys = Object.keys(Me.env), l = keys.length; l; --l)	{
		   reqEnv[ keys[l-1] ] = Me.env[ keys[l-1] ];
		}
		return reqEnv;
	},paramsForRequest:function(req, reqEnv) {
		if (typeof(reqEnv) == "undefined") reqEnv = Me.newRequestParams();
		
		reqdata = require("url").parse(req.url,true);
		//set environment variables for this request
		reqEnv['SCRIPT_NAME'] = reqdata.pathname;
		reqEnv['PATH_INFO'] = path.normalize(reqEnv['DOCUMENT_ROOT']+reqdata.pathname);
		reqEnv['PATH_TRANSLATED'] = path.normalize(reqEnv['DOCUMENT_ROOT']+reqdata.pathname);
		reqEnv['QUERY_STRING'] = '';
		for(var p in reqdata.query) {
			reqEnv['QUERY_STRING'] += p+"="+encodeURIComponent(reqdata.query[p])+"&";
		}
		reqEnv['REQUEST_METHOD'] = req.method;
		
		//add request headers, "User-Agent" -> "HTTP_USER_AGENT"
		for (var header in req.headers) {
			reqEnv['HTTP_' + header.toUpperCase().split("-").join("_")] = req.headers[header];
		}
		//copy in additional special headers..
		if ('content-length' in req.headers) {
			reqEnv['CONTENT_LENGTH'] = req.headers['content-length'];
		}
		if ('content-type' in req.headers) {
			reqEnv['CONTENT_TYPE'] = req.headers['content-type'];
		}
		if ('authorization' in req.headers) {
			reqEnv['AUTH_TYPE'] = req.headers.authorization.split(' ')[0];
		}
		return reqEnv;
	},detectBinary:function() {
		if (process.platform == 'win32') {
			//detect a local "portable" php install.
			Me.bin = require("php-bin-win32").bin;
		}
	/**
	* This is an automatic function, will add a function you can override later on.
	*/
	},serveResponse:function(req, res, reqEnv, params) {
		if (typeof(params) == "undefined") params = {};
		var cgi = spawn(Me.bin, [], {
		  'env': reqEnv
		});
console.log(Me.bin);	
		req.pipe(cgi.stdin);
		if (params['sterr']) {
			cgi.stderr.on('data',params.sterr);
		} else {
			cgi.stderr.on('data',function(data) {
				console.log("cgi error:"+data.toString());
			});
		}	
		var headersSent = false;
		cgi.stdout.on('data',function(data) {		
			if (headersSent) {
				//stream data to browser as soon as it is available.
				//console.log(data.toString());
				res.write(data);
			} else {
				
				var lines = data.toString().split("\r\n");
				//set headers until you get a blank line...
				for(var l=0;l<lines.length;l++) {
					if (lines[l] == "") {
						if (!res.getHeader("content-length")) {
							//stream the output
							res.setHeader('Transfer-Encoding', 'chunked');
						}
						res.writeHead(200);
						headersSent = true;
						res.write(lines.slice(l+1).join('\r\n'));
						break;
					} else {
						//set header
						var header = lines[l].split(":");
						res.setHeader(header[0], header[1]||'');
					}
				}
			}
			
		});
		cgi.stdout.on('end',function() {
			res.end();
		});
	}
}

module.exports = Me;