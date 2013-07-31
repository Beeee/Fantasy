var aux = require("./auxiliar");

var getUserInformation = function(params,callback) {

    if(params["username"] === undefined) {
        return callback(400, "Bad Request");
    }

    var sql = "SELECT username, UserTeam.name AS teamName, UserLeague.name AS leagueName " +
        "FROM User, UserTeam LEFT JOIN UserLeague ON UserTeam.leagueID=UserLeague.leagueID " +
        "WHERE User.userTeamID=UserTeam.userTeamID " +
        "AND User.username="+aux.connection.escape(params["username"]);
    aux.connection.query(sql, function(err, rows) {
        if(err) {
            aux.onError(err,callback);
        }
        else if(rows.length != 1 || rows === undefined) {
            callback(500,"internal server error");
        }
            else {
            callback(200, "OK", {}, rows[0]);
        }

    });
};

exports.dispatch = {
    GET:    getUserInformation
};