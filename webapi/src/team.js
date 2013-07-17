var aux = require("./auxiliar");

var getTeamInformation = function(params,callback) {
    var sql = "SELECT Player.playerID, Player.name AS playerName, Player.position, Player.realTeamID, RealTeam.name AS teamName FROM Player, RealTeam WHERE Player.realTeamID = RealTeam.idrealTeam";

    if(params["team"] !== undefined)
    {
        sql = sql+" AND RealTeam.name="+aux.connection.escape(params["team"]);
    }
    if(params["position"] !== undefined) {
        sql = sql+" AND Player.position="+aux.connection.escape(params["position"]);
    }

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
};

exports.dispatch = {
    GET:    getTeamInformation
};
