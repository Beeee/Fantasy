var aux = require("./auxiliar");
var teamHelpers = require("./team_helpers");
var score = require("./score/score");
var constants = require("./constants");
//var _io = "";

/*
module.exports = function (io) {
    _io = io;
}

function socketActivity(data) {
    _io.sockets.emit("news", data);
};
*/
var getLeagueInformation = function (params, callback) {
    var username = "";
    if (params['authorization'] !== undefined) {
        var auth = aux.authenticate(params);
        username = auth["username"];
    }
    else if (params["username"] !== undefined) {
        username = params["username"];
    }
    else {
        return callback(400, "Bad Request");
    }
  //  socketActivity(username);
    teamHelpers.getLeagueIDFromUsername(username, callback, function (leagueID) {
        if (params["onlyGameweekScore"] == "1") {
            if (params["gameweekNumber"] !== undefined) {
                score.getGameweekLeagueScore(leagueID, params["gameweekNumber"], callback);
            }
            else {
                score.getGameweekLeagueScore(leagueID, constants.GAMEWEEKNUMBER - 1, callback);
            }
        }
        else {
            score.getOverallLeagueScore(leagueID, callback);
        }
    });
};

var addTeam = function(params,callback) {
    var auth = aux.authenticate(params);
    aux.loginWithUserPw(auth["username"],auth["password"], function() {
            if(params["username"] === undefined)
            {
                callback(400, "Bad Request");
            }
            else
            {
                validateUserAddTeam(params["username"], callback, function(userTeamID) {
                    teamHelpers.adminCheck(auth["username"],callback, function(leagueID) {
                        teamHelpers.isLeagueLocked(leagueID,callback,function(){
                            callback(400, "League is no longer open");
                        }, function() {
                            insertTeamInLeagueSQL(leagueID, userTeamID, callback);
                        });
                    });
                });
            }
        },
        function() {
            return aux.unauthorized(callback);
        });

};

function validateUserAddTeam(username,callback,acceptedCallback){
    var sql = "SELECT UserTeam.userTeamID " +
        "FROM User, UserTeam " +
        "WHERE User.userTeamID=UserTeam.userTeamID AND leagueID IS NULL AND User.username="+aux.connection.escape(username);
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else if(rows === undefined || rows.length != 1)
        {
            callback(403, "THE TEAM ALREADY HAS A LEAGUE");
        }
        else {
            acceptedCallback(rows[0]["userTeamID"]);
        }
    });
};

function insertTeamInLeagueSQL(leagueID,userTeamID,callback) {
    var sql = "UPDATE UserTeam " +
        "SET leagueID="+aux.connection.escape(leagueID)+" " +
        "WHERE userTeamID="+aux.connection.escape(userTeamID);
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else {
            callback(202, "Accepted");
        }
    });
};

var createLeague = function(params,callback) {
    var auth = aux.authenticate(params);
    aux.loginWithUserPw(auth["username"],auth["password"], function() {
        if(params["name"] === undefined)
        {
             callback(400, "Bad Request");
        }
        else
        {
                validateUser(auth["username"], callback, function() {
                    var data = {
                        "name": auth["username"],
                        "admin": params["name"],
                        "final": 0,
                        "draftIsActive": 0
                    }
                    if(params["draftDate"] !== undefined) {
                        data["draftDate"] = new Date(params["draftDate"]);
                    }
                    createNewLeagueSQL(data, function(err){
                        handleCreateLeagueSQLError(err,callback);
                    }, function(){
                        teamHelpers.adminCheck(auth["username"], callback, function(leagueID) {
                            teamHelpers.getUserTeamIDFromUsername(auth["username"],callback, function(userTeamID) {
                                bindTeamAndLeagueSQL(leagueID,userTeamID,function(err){
                                    deleteLeague(leagueID,callback);
                                    aux.onError(err, callback);
                                } ,function() {
                                    callback(202, "Accepted");
                                });
                            });
                        });
                    } );
                });
        }
    },
        function() {
        return aux.unauthorized(callback);
    });
};

function validateUser(username,callback, acceptCallback) {
    var sql = "SELECT * " +
        "FROM User, UserTeam " +
        "WHERE User.userTeamID=UserTeam.userTeamID AND leagueID IS NULL AND User.username="+aux.connection.escape(username);
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else if(rows === undefined || rows.length != 1)
        {
            callback(403, "THE TEAM ALREADY HAS A LEAGUE");
        }
        else {
            acceptCallback();
        }
    });
};

function createNewLeagueSQL(data, errorCallback, acceptCallback) {
    var sql = "INSERT INTO UserLeague SET ?";
    aux.connection.query(sql, data, function(err) {
        if(err) {
            errorCallback(err);
        }
        else {
            acceptCallback();
         }
    });
};

function handleCreateLeagueSQLError(err,callback){
    if(err["code"] == 'ER_DUP_ENTRY') {
        callback(403, "LEAGUE NAME ALREADY EXISTS");
    }
    else
    {
        aux.onError(err, callback);
    }
};

function bindTeamAndLeagueSQL(leagueID,userTeamID, errorCallback ,acceptCallback) {
    var sql = "UPDATE UserTeam SET leagueID="+aux.connection.escape(leagueID)+" WHERE userTeamID="+aux.connection.escape(userTeamID);
    aux.connection.query(sql, function(err) {
        if(err)
        {
            errorCallback(err);
        }
        else
        {
            acceptCallback();
        }
    });

};

function deleteLeague(leagueID,callback) {
    var sql = "DELETE FROM UserLeague WHERE leagueID="+leagueID;
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
    });
};

var removeTeam = function(params,callback) {
    return callback(200, "NOT IMPLEMENTED");
};

exports.dispatch = {
    GET:    getLeagueInformation,
    PUT:    addTeam,
    POST:   createLeague,
    DELETE:   removeTeam
};