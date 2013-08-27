var aux = require("./auxiliar");
var teamHelpers = require("./team_helpers");
var createteam = require("./userteam/create_team")
var constants = require("./constants");
var playerPicker = require("./subs/pickPlayer")

var getTeam = function(params,callback) {
    if(params["username"] === undefined)
    {
        return callback(400, "Bad Request");
    }
    var gameweek = constants.GAMEWEEKNUMBER;
    if(params["gameweek"] === undefined){
        gameweek = params["gameweek"];
    }

    var sql = "SELECT playerID, playerName, position, substitute  FROM teamsView WHERE "
        +"gameweekNumber="+aux.connection.escape(gameweek)
        +" AND username="+aux.connection.escape(params["username"]);
    return aux.connection.query(sql, function(err, rows) {
        if(err) { return aux.onError(err, callback);  }
        else{
            var result = generateTeamResult(rows);
            return callback(200, "OK", {}, result);
            }
        });
 };

var createTeam = function(params,callback) {
   createteam.main(params,callback);
};

var deleteTeam = function(params,callback) {
    var allowHeader = {"Allow": "GET, POST"};
    return callback(405, "Method Not Allowed",allowHeader);
};

var pickPlayerFromPool = function(params,callback) {
    var allowHeader = {"Allow": "GET, POST"};
    return callback(405, "Method no longer available, use draft related method",allowHeader);
};


function generateTeamResult(rows) {
    var result =
    {
        "keepers" : [],
        "defenders" : [],
        "midfielders" : [],
        "forwards" : []
    }
    for (var i in rows) {
        var data =
        {
            "playerID": rows[i]["playerID"],
            "playerName": rows[i]["playerName"],
            "substitute": rows[i]["substitute"][0]
        }
        if(rows[i]["position"] == "keeper") {
            result["keepers"].push(data);
        }
        else if(rows[i]["position"] == "defender") {
            result["defenders"].push(data);
        }
        else if(rows[i]["position"] == "midfielder") {
            result["midfielders"].push(data);
        }
        else {
            result["forwards"].push(data);
        }
    }
    return result;
};

exports.dispatch = {
    GET:    getTeam,
    PUT:    pickPlayerFromPool,
    POST:   createTeam,
    DELETE: deleteTeam
};