var aux = require("./auxiliar");
var teamHelpers = require("./team_helpers");
var createteam = require("./userteam/create_team")

var getTeam = function(params,callback) {
    if(params["gameweek"] === undefined || params["username"] === undefined)
    {
        return callback(400, "Bad Request");
    }
    var sql = "SELECT playerID, playerName, position, substitute  FROM teamsView WHERE "
        +"gameweekNumber="+aux.connection.escape(params["gameweek"])
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
    var allowHeader = {"Allow": "GET, PUT, POST"};
    return callback(405, "Method Not Allowed",allowHeader);
};

var pickPlayerFromPool = function(params,callback) {
    var auth = aux.authenticate(params);
    aux.loginWithUserPw(auth["username"],auth["password"],
        function() {
            teamHelpers.getuserTeamIDAndLeagueID(auth["username"], callback, function(userTeamID,leagueID) {
                checkIfPlayerAlreadyExists(leagueID,params["playerid"],"1",callback, function() {
                    teamHelpers.isValid(userTeamID,"1",params["playerid"],callback,function(){
                        insertPlayer(userTeamID,params["playerid"],"1",callback);
                    });
     //
                });
            });
        },
        function() {
            aux.unauthorized(callback);
        });
};

function checkIfPlayerAlreadyExists(leagueID,playerID,gameweekNumber,callback,acceptCallback) {
    var sql = "SELECT * FROM playerInformation " +
              "WHERE gameWeekNumber="+aux.connection.escape(gameweekNumber)+
              " AND leagueID="+aux.connection.escape(leagueID)+
              " AND playerID="+aux.connection.escape(playerID);
    aux.connection.query(sql, function(err, rows) {
        if(err ||rows === undefined|| rows.length != 0)
        {
            aux.onError(err, callback);
        }
        else
        {
            acceptCallback();
        }
    });
};

function insertPlayer(userTeamID,playerID,gameweekNumber,callback) {
    var sql = "INSERT INTO GameweekTeam_has_Player SET ?";
    var data =
    {
        "userTeamID": userTeamID,
        "gameWeekNumber": gameweekNumber,
        "playerID": playerID,
        "substitute": "0"
    }
    aux.connection.query(sql, data, function(err) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else
        {
            callback(202, "ACCEPTED");
        }
    });
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