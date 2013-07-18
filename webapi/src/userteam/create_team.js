var aux = require("./../auxiliar");
var teamHelpers = require("./../team_helpers");

exports.main = function(params,callback) {
    var auth = aux.authenticate(params);
    aux.loginWithUserPw(auth["username"],auth["password"],
        function() {
            userHasNoTeam(auth["username"],callback, function() {
                insertUserTeam(params["name"], function(err){
                    handleuserTeamSQLError(err,callback)
                },function(){
                    teamHelpers.getUserTeamIDFromName(params["name"], callback, function(userTeamID) {
                        updateUserandaddGameweek(userTeamID, auth, callback, function(err) {
                            deleteuserTeamSQL(userTeamID,callback);
                            aux.onError(err, callback);
                        } ,function() {
                            gameweekTEAMSQL(userTeamID, callback, function(err) {
                                deleteuserTeamSQL(userTeamID,callback);
                                deleteGameweekSQL(userTeamID,callback);
                                aux.onError(err, callback);
                            });
                        });
                    });
                });
            });
        },
        function() {
            aux.unauthorized(callback);
        });
}

function userHasNoTeam(username,callback, acceptCallback) {
    var hasTeamsql = "SELECT userTeamID FROM User " +
        "WHERE userTeamID IS NOT NULL AND username="+aux.connection.escape(username);
    aux.connection.query(hasTeamsql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else if(rows.length != 0)
        {
            callback(403, "TEAM ALREADY EXISTS");
        }
        else
        {
            acceptCallback();
        }
    });
};

function insertUserTeam(name,errorCallback, acceptCallback) {
    var userTEAMSQL = "INSERT INTO UserTeam SET ?";
    var data = {
        name: name
    }
    return aux.connection.query(userTEAMSQL, data, function(err) {
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

function handleuserTeamSQLError(err,callback){
    if(err["code"] == 'ER_DUP_ENTRY') {
        callback(403, "TEAMNAME ALREADY EXISTS");
    }
    else
    {
        aux.onError(err, callback);
    }
};

function updateUserandaddGameweek(userTeamID, auth, callback,errorHandlerCallback, acceptCallback) {
    var connectUserAndTeamSQL  = "UPDATE User SET userTeamID="+aux.connection.escape(userTeamID)
        +" WHERE username="+aux.connection.escape(auth["username"]) +
        " AND password="+aux.connection.escape(auth["password"]);
    aux.connection.query(connectUserAndTeamSQL, function(err) {
        if(err)
        {
            errorHandlerCallback(err);

        }
        else
        {
            acceptCallback();
        }
    });
};

function gameweekTEAMSQL(userTeamID,callback, errorHandlerCallback) {
    var gameWeekTeamSQL = "INSERT INTO GameweekTeam SET ?";
    var gameweekData = {
        "gameWeekNumber": "1",
        "userTeamId": userTeamID
    }
    aux.connection.query(gameWeekTeamSQL,gameweekData, function(err) {
        if(err)
        {
            errorHandlerCallback(err);

        }
        else
        {
            callback(202, "ACCEPTED");
        }
    });
};

function deleteuserTeamSQL(userTeamID,callback){
    var deleteUserTeamSQL = "DELETE FROM UserTeam WHERE userTeamID="+aux.connection.escape(userTeamID);
    aux.connection.query(deleteUserTeamSQL, function(err) {
        if(err)
        {
            aux.onError(err, callback);
        }
    });
};

function deleteGameweekSQL(userTeamID, callback) {
    var deleteGmwSQL = " UPDATE User SET userTeamID=NULL WHERE userTeamID="+aux.connection.escape(userTeamID);
    aux.connection.query(deleteUserTeamSQL, function(err) {
        if(err)
        {
            aux.onError(err, callback);
        }
    });
};