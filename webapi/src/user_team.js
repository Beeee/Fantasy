var aux = require("./auxiliar");
var teamHelpers = require("./team_helpers");
var createteam = require("./userteam/create_team")
var constants = require("./constants");

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
    var allowHeader = {"Allow": "GET, PUT, POST"};
    return callback(405, "Method Not Allowed",allowHeader);
};

var pickPlayerFromPool = function(params,callback) {
    var auth = aux.authenticate(params);
    var gameWeekNumber = constants.GAMEWEEKNUMBER;
    aux.loginWithUserPw(auth["username"],auth["password"],
        function() {
            teamHelpers.getuserTeamIDAndLeagueID(auth["username"], callback, function(userTeamID,leagueID) {
                teamHelpers.checkIfPlayerIsAvailableInTheLeague(leagueID,params["playerid"],gameWeekNumber,callback, function() {
                    teamHelpers.getTeam(userTeamID,gameWeekNumber,callback,function(team){
                        checkPlayerAvail(team, params["playerid"],callback,function() {
                            insertPlayer(userTeamID,params["playerid"],gameWeekNumber,callback, function() {
                                teamHelpers.getTeam(userTeamID,gameWeekNumber,callback, function (newTeam) {
                                    if(newTeam.length == 16) {

                                          setUpTeam(newTeam);
                                      }
                                    callback(202, "ACCEPTED");
                                });
                            });
                        });
                    });
     //
                });
            });
        },
        function() {
            aux.unauthorized(callback);
        });
};

function checkPlayerAvail(team,playerID, callback, acceptCallback) {

    var count = teamHelpers.countTeamPosition(team);
    teamHelpers.getPlayerPosition(playerID,callback, function(position){
        if(teamHelpers.positionIsNotFull(position,count)){
            acceptCallback();
        }
        else
        {
            callback(403, "POSITION FULL");
        }
    });
};

function setUpTeam(team) {
    var playerIDlist = [];
    var keeper = false;
    var defender = false;
    var defender2 = false
    var midfielder = false;
    var forward = false;
    var userTeamID = team[0]["userTeamID"];

    for(var i in team) {
        if(team[i]["position"] == "keeper" && keeper == false) {
            keeper = true;
            playerIDlist.push(team[i]["playerID"]);
        }
        if(team[i]["position"] == "defender" && (defender == false || defender2 == false)) {
            if(!defender) {
                defender = true;
                playerIDlist.push(team[i]["playerID"]);
            }
            else if(!defender2)
            {
                defender2 = true;
                playerIDlist.push(team[i]["playerID"]);
            }
            else {
                //do nothing
            }
        }
        if(team[i]["position"] == "midfielder" && midfielder == false) {
            midfielder = true;
            playerIDlist.push(team[i]["playerID"]);
        }
        if(team[i]["position"] == "forward" && forward == false) {
            forward = true;
            playerIDlist.push(team[i]["playerID"]);
        }
    }

    var sql = "UPDATE GameweekTeam_has_Player SET substitute=1 " +
        "WHERE userTeamID=" +aux.connection.escape(userTeamID)+
        " AND gameWeekNumber="+constants.GAMEWEEKNUMBER +
        " AND (playerID="+aux.connection.escape(playerIDlist[0]) +
        " OR playerID="+aux.connection.escape(playerIDlist[1]) +
        " OR playerID="+aux.connection.escape(playerIDlist[2]) +
        " OR playerID="+aux.connection.escape(playerIDlist[3]) +
        " OR playerID="+aux.connection.escape(playerIDlist[4]) +
        ")";
    aux.connection.query(sql, function(err) {
        if(err)
        {
            console.log(err);
            console.log("Klarte ikke å sette opp subs!! BUG BUG BUG");
        }
    });

};

function insertPlayer(userTeamID,playerID,gameweekNumber,callback, acceptCallback) {
    var sql = "INSERT INTO GameweekTeam_has_Player SET ?";
    var data =
    {
        "userTeamID": userTeamID,
        "gameWeekNumber": gameweekNumber,
        "playerID": playerID,
        "substitute": 0
    }
    aux.connection.query(sql, data, function(err) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else
        {
            acceptCallback();
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