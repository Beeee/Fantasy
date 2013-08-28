var aux = require("./../auxiliar");
var constants = require("./../constants");
var team_helpers = require("./../team_helpers");

exports.main = function (params, callback) {
    var gameweek = setGameWeekVariable(params);
    var username = getUserName(params);
    var userTeamName = params["userteam"];
    console.log(userTeamName);

    console.log("1");
    generateSQLStatement(gameweek, username, userTeamName, callback, function () {
        callback(400, "Bad Request");
        console.log("2");
    }, function (sql) {
        console.log("3");
        getFromDatabase(sql, callback);
    });

}

function generateSQLStatement(gameweek,username,userTeamName,callback,badInputCallback,acceptCallback){
    var sql = "SELECT * FROM mydb.gameWeekViewPlayers WHERE gameWeekNumber=" + aux.connection.escape(gameweek);
    if (username === undefined && userTeamName === undefined) {
        console.log("4");
        return badInputCallback();
    }

    if (userTeamName !== undefined) {
        console.log("5");

        sql += " AND teamName=" + aux.connection.escape(userTeamName)
    }

    if (username !== undefined) {
        console.log("6");
        team_helpers.getUserTeamIDFromUsername(username, callback, function (userTeamID) {
            console.log("7");
            sql += " AND teamID=" + aux.connection.escape(userTeamID)
            console.log(sql);
            return acceptCallback(sql);
        })
    }
    else {
        console.log(sql);
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
            console.log("10");
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
