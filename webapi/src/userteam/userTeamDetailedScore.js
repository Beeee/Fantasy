var aux = require("./../auxiliar");
var constants = require("./../constants");
var team_helpers = require("./../team_helpers");

exports.main = function (params, callback) {
    var gameweek = setGameWeekVariable(params);
    var username = getUserName(params);
    var userTeamName = params["userteam"];

    generateSQLStatement(gameweek, username, userTeamName, callback, function () {
        callback(400, "Bad Request");
    }, function (sql) {
        getFromDatabase(sql, callback);
    });

}

function generateSQLStatement(gameweek,username,userTeamName,callback,badInputCallback,acceptCallback){
    var sql = "SELECT * FROM mydb.gameWeekViewPlayers WHERE gameWeekNumber=" + aux.connection.escape(gameweek);
    if (username === undefined && userTeamName === undefined) {
        return badInputCallback();
    }

    if (userTeamName !== undefined) {

        sql += " AND teamName=" + aux.connection.escape(userTeamName)
    }

    if (username !== undefined) {
        team_helpers.getUserTeamIDFromUsername(username, callback, function (userTeamID) {
            sql += " AND teamID=" + aux.connection.escape(userTeamID)
            return acceptCallback(sql);
        })
    }
    else {
       return acceptCallback(sql);
    }
}

function getFromDatabase(sql,callback){
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else if(rows === undefined )
        {
            callback(403, "BUG");
        }
        else {
            return callback(200, "OK",{},rows);
        }
    });
}

function getUserName(params) {
    if (params['authorization'] !== undefined) {
        var auth = aux.authenticate(params);
        return username = auth["username"];
    }
    else if (params["username"] !== undefined) {
      return username = params["username"];
    }
    else {
        return undefined;
    }
};

function setGameWeekVariable(params) {
    var gameweek = constants.GAMEWEEKNUMBER-1;
    if (params["gameWeekNumber"] !== undefined) {
        gameweek = params["gameWeekNumber"];
    }
    return gameweek;
};
