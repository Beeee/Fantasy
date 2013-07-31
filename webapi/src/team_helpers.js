var aux = require("./auxiliar");

exports.getTeam = function(userTeamID, gameweekNumber,callback, acceptCallback) {
    var sql = "SELECT * FROM teamsView " +
        "WHERE userTeamID="+aux.connection.escape(userTeamID)+
        " AND gameweekNumber="+aux.connection.escape(gameweekNumber);
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else
        {
            acceptCallback(rows);
        }
    });
};

exports.countTeamPosition = function(team) {
    var result =
    {
        "keepers" : 0,
        "defenders" : 0,
        "midfielders" : 0,
        "forwards" : 0
    }
    for (var i in team) {
        addToPosition(team[i]["position"],result);
    }
    return result;
};

function addToPosition(position, result) {
    if(position == "keeper") {
        result["keepers"]++;
    }
    else if(position == "defender") {
        result["defenders"]++;
    }
    else if(position == "midfielder") {
        result["midfielders"]++;
    }
    else {
        result["forwards"]++;
    }
};

exports.countPlayingTeam = function(team) {
   var result =
   {
       "keepers" : 0,
       "defenders" : 0,
       "midfielders" : 0,
       "forwards" : 0
   }
   for (var i in team) {
       var substitute =  JSON.stringify(team[i]["substitute"])[1]
        if(substitute == 0) {
            addToPosition(team[i]["position"],result);
        }
   }
    return result;
};

exports.getPlayerPosition = function(playerID, callback, acceptCallback) {
    var sql = "SELECT position FROM Player WHERE playerID="+aux.connection.escape(playerID);
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else if(rows.length == 0 || rows === undefined) {
            callback(500, "The player does not exist")
        }
        else
        {
            acceptCallback(rows[0]["position"]);
        }
    });
};

exports.positionIsNotFull = function(position,count) {
    return isBelow(position, count, 2,6,5,3);
};

exports.isValidPlayingTeam = function(count) {
    if(count["keepers"] != 1) {return false;}
    if(!isBetween(count["defenders"],4,5)) {return false;}
    if(!isBetween(count["midfielders"],3,5)) {return false;}
    if(!isBetween(count["forwards"],1,3)) {return false;}
    if(getNumberOfPlayers(count) != 11) {return false;}
    return true;
};

function isBetween(value, min,max) {
    if (value >= min && value <= max) {
        return true;
    }
    else {
        return false;
    }
}

/*
    Denne metoden er ikke helt safe, hvis playerIDen ikke eksisterer vil den fortsatt returnere true,
    //TODO: Vurder en sjekk om iden fins. Og endre returnkode dersom spilleren finnes
 */
exports.checkIfPlayerIsAvailableInTheLeague = function(leagueID,playerID,gameweekNumber,callback,acceptCallback) {
    var sql = "SELECT * FROM playerInformation " +
        "WHERE gameWeekNumber="+aux.connection.escape(gameweekNumber)+
        " AND leagueID="+aux.connection.escape(leagueID)+
        " AND playerID="+aux.connection.escape(playerID);
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else if(rows === undefined || rows.length != 0) {
             callback(500, "Player is not available");
        }
        else
        {
            acceptCallback();
        }
    });
};

function getNumberOfPlayers(count) {
    return  count["keepers"] + count["defenders"]+count["midfielders"] + count["forwards"];
}

function isBelow(position,count, keeperLimit, defenderLimit, midfieldLimit, ForwardLimit){
    if(position == "keeper") {
        if(count["keepers"] < keeperLimit) {return true;}
        else{return false;}
    }
    if(position == "defender") {
        if(count["defenders"] < defenderLimit) {return true;}
        else{return false;}
    }
    if(position == "midfielder") {
        if(count["midfielders"] < midfieldLimit) {return true;}
        else{return false;}
    }
    if(position == "forward") {
        if(count["forwards"] < ForwardLimit) {return true;}
        else{return false;}
    }
    else{
        return false;
    }
};

exports.getUserTeamIDFromName = function(name,callback, acceptCallback) {
    var userUserTeamIDSQL = "SELECT userTeamID FROM UserTeam WHERE name="+aux.connection.escape(name);
    getUserTeamID(userUserTeamIDSQL,callback,acceptCallback);
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
        if(err)
        {
            aux.onError(err, callback);
        }
        else if(rows == undefined || rows.length != 1) {
            callback(500, "Internal server error");
        }
        else
        {
            acceptCallback(rows[0]["userTeamID"],rows[0]["leagueID"]);
        }
    });
};

exports.getLeagueIDFromUsername = function(username,callback, acceptCallback) {
    var sql = "SELECT leagueID FROM teamsLeagueInformation WHERE username="+aux.connection.escape(username);
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else if(rows == undefined || rows.length != 1) {
            callback(500, "Internal server error");
        }
        else
        {
            acceptCallback(rows[0]["leagueID"]);
        }
    });
};

exports.adminCheck =  function (adminUsername,callback, acceptCallback) {
    var sql =  "SELECT leagueID FROM adminsView WHERE username="+aux.connection.escape(adminUsername);
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else if(rows === undefined || rows.length != 1)
        {
            callback(403, "THE USER IS NOT AN ADMIN");
        }
        else {
            acceptCallback(rows[0]["leagueID"]);
        }
    });
};
