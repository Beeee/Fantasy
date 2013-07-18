var aux = require("auxiliar");

exports.isValid = function(userTeamID, gameweekNumber,playerID, callback, acceptCallback) {
    var sql = "SELECT * FROM teamsView " +
        "WHERE userTeamID="+aux.connection.escape(userTeamID)+
        "AND gameweekNumber="+aux.connection.escape(gameweekNumber);
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else
        {
            var count = countTeamPosition(rows);
            getPlayerPosition(playerID,callback, function(position){
                if(positionIsNotFull(position,count)){
                    acceptCallback();
                }
                else
                {
                    callback(403, "POSITION FULL");
                }
            });
            //
        }
    });
};

function countTeamPosition (rows) {
    var result =
    {
        "keepers" : 0,
        "defenders" : 0,
        "midfielders" : 0,
        "forwards" : 0
    }
    for (var i in rows) {
        if(rows[i]["position"] == "keeper") {
            result["keepers"]++;
        }
        else if(rows[i]["position"] == "defender") {
            result["defenders"]++;
        }
        else if(rows[i]["position"] == "midfielder") {
            result["midfielders"]++;
        }
        else {
            result["forwards"]++;
        }
    }
    return result;
};

function getPlayerPosition(playerID, callback, acceptCallback) {
    var sql = "SELECT position FROM Player WHERE playerID"+aux.connection.escape(playerID);
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else
        {
            acceptCallback(rows[0]["position"]);
        }
    });
};

function positionIsNotFull(position,count) {
    if(position == "keeper") {
        if(count[position] < 2) {return true;}
        else{return false;}
    }
    else if(position == "defender") {
        if(count[position] < 6) {return true;}
        else{return false;}
    }
    else if(position == "midfielder") {
        if(count[position] < 5) {return true;}
        else{return false;}
    }
    else {
        if(count[position] < 3) {return true;}
        else{return false;}
    }
};

exports.getUserTeamIDFromName = function(name,callback, acceptCallback) {
    var userUserTeamIDSQL = "SELECT userTeamID FROM UserTeam WHERE name="+aux.connection.escape(name);
    getUserTeamID(sql,callback,acceptCallback);
};

exports.getUserTeamIDFromUsername = function(username,callback, acceptCallback) {
    var sql = "SELECT userTeamID FROM User WHERE username="+aux.connection.escape(username);
    getUserTeamID(sql,callback,acceptCallback);
};

function getUserTeamID(sql,callback, acceptCallback) {
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else if(rows === undefined || rows.length != 1)
        {
            callback(500, "UNEXPECTED INTERNAL ERROR");
        }
        else
        {
            acceptCallback(rows[0]["userTeamID"]);
        }
    });
};

exports.getuserTeamIDAndLeagueID = function(username,callback, acceptCallback) {
    var sql = "SELECT UserTeam.userTeamID, UserTeam.leagueID " +
        "FROM UserTeam,User " +
        "WHERE User.userTeamID=UserTeam.userTeamID " +
        "AND User.username="+aux.connection.escape(username)+" " +
        "AND leagueID IS NOT NULL";

    aux.connection.query(sql, function(err, rows) {
        if(err ||rows === undefined|| rows.length != 1)
        {
            aux.onError(err, callback);
        }
        else
        {
            acceptCallback(rows[0]["userTeamID"],rows[0]["leagueID"]);
        }
    });
};