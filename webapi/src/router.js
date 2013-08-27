var url = require('url');
var aux = require("./auxiliar");
//var https = require('https');
var http = require('http');
var fs = require('fs');
//var logger = require('./log');


aux.setUpConnection();
aux.setGameWeekConstant();


var services = {
    user:  require("./user_service"),
    userteam: require("./user_team"),
    transfers: require("./user_team2"),
    league: require("./league"),
    team:  require("./team"),
    player: require("./player"),
    userinformation: require("./user_information"),
    watchlist: require("./watchlist"),
    swap: require("./swap_players"),
    draft: require("./draft"),
    drafttransfer: require("./drafttransfers"),
    gameweeks: require("./round"),
    djsafhauwnakmdawkhedunijasdkjahbwyuadhsjbakdjwaidhwdadasdsaidjiadaidasijdasidayuttcbcbcbbcxn: require("./increment")
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

function getbodyParams(body) {
    var bodyParams = [];
    try {
        bodyParams =  JSON.parse(body);
    }
    catch (e) {
        bodyParams = []
        console.log(e);
        console.log("syntax:"+body);
    }
    return bodyParams;
};

function routeCall(req, res, body) {
  // Get parameters, both from the URL and the request body
  var urlObj = url.parse(req.url, true);
  var params = urlObj.query;
  if(typeof body !== "undefined")
  {
    var bodyParams = getbodyParams(body);
        for (var p in bodyParams) {
            params[p] = bodyParams[p];
        }

  }
  params["path"] = urlObj.pathname.split("/");

  if(req.headers["authorization"] !== undefined)
  {
	params["authorization"] = req.headers["authorization"];
  }  
  var toCall = urlObj.pathname.split("/")[1];
  
  if (typeof services[toCall] === "undefined")
  {
	console.log(toCall+ " is undefined");
    return sendResults(params["callback"],res, 404, "SERVICE NOT FOUND");
  }
  
  if (typeof services[toCall]["dispatch"][req.method] === "undefined")
  {
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
 // logger.info(err);
});

/*
var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};
*/

//https.createServer(options,function (req, res) {
http.createServer(function (req, res) {
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

console.log("server restarted");
/*
var io = require('socket.io').listen(3000);
io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
});
*/

