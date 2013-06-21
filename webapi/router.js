var url = require('url');
var https = require('https');
var fs = require('fs');

var services = {
  user:  require("./user_service")
};

function sendResults(callback, res, status, statusText, headers, result) {
  if (typeof headers === "undefined"){ headers = {};}
  if (typeof result === "undefined"){ result = {};}
  
  headers["Connection"] = "close";
  headers["Content-Type"] = "application/json";
  res.writeHead(status, statusText, headers);
   if (typeof callback !== "undefined"){
    res.end(callback + "(" + JSON.stringify(result) + ");");
	}
  else{
    res.end(JSON.stringify(result));
	}
};


function routeCall(req, res, body) {
 if(typeof body === "undefined") {body = ""; }
  // Get parameters, both from the URL and the request body
  var urlObj = url.parse(req.url, true);
  var params = urlObj.query;
  params["path"] = urlObj.pathname.split("/");
  
  if(req.headers['authorization'] !== undefined) {
	params['authorization'] = req.headers['authorization'];
  }  
  var toCall = urlObj.pathname.split("/")[1];
  
  if (typeof services[toCall] === "undefined") {
	console.log(toCall+ " is undefined");
    return sendResults(params["callback"],res, 404, "SERVICE NOT FOUND");
  }
  
  if (typeof services[toCall]["dispatch"][req.method] === "undefined") {
		console.log("Undefined service for "+toCall);
    return sendResults(params["callback"],res, 404, "SERVICE NOT FOUND");
	}
  
  services[toCall]["dispatch"][req.method](params, function(status, statusText, headers, result){
      return sendResults(params["callback"], res, status, statusText, headers, result);
    });
}
// Unexpected error catching
process.on('uncaughtException', function(err) {
  console.error("UNCAUGHT EXCEPTION...");
  console.error(err);
  console.error(err.stack);
});


var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options,function (req, res) {
  //  For PUT/POST methods, wait until the
  //  complete request body has been read.
  //POST OG PUT ER FORELØPG IKKE STØTTA :)
  if (req.method==="POST" || req.method==="PUT") {
    var body = "";
    req.on("data", function(data){
      body += data;
    })

    req.on("end", function(){
      return routeCall(req, res, body);
    })

  } else {
    return routeCall(req, res);
  }
}).listen(8888);
