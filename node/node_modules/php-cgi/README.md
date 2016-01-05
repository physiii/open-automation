node-php-cgi
============

npm module to run php scripts from nodejs through cgi. This module was developed for deskshell 
(http://deskshell.org) to allow seamless handling of php scripts.

Given that you get a request in nodejs and have a request object (called req) and a response object (called res) this is how you would use this module:

    
    reqdata = require("url").parse(req.url,true);
		switch(require("path").extname(reqdata.pathname)) {
		    case ".php":
				    var phpCGI = require("php-cgi");
				    phpCGI.detectBinary();//on windows get a portable php to run.
				    phpCGI.env['DOCUMENT_ROOT'] = __dirname+path.sep+'htdocs'+path.sep;
				    phpCGI.serveResponse(req, res, phpCGI.paramsForRequest(req));
				break;
		}

So a request to /test.php would be responded to by the php-cgi module. The paramsForRequest function reads the request object and sets the correct cgi environmental variables for the request. This is provided as a separate function so it
is possible to add in additional request variables as needed. The detectBinary function on windows looks for an additional
node module "php-bin-win32" that provides a portable php binary.
 
This code works for deskshell, contact me if you want to use it for some other purpose and need additional features / support.

