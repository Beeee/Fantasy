var helpers = require("./../team_helpers")
var aux = require("./../auxiliar")

exports.main = function(params,callback) {
    if(params["playerid"] === undefined) {
        return callback(400, "bad request");
    }
    helpers.loginGetUserNameANDuserTeamIDAnduserLeagueIDWithOutCallback(params,callback,function(username,userTeamID,leagueID) {
           removePlayer(userTeamID, leagueID, params["playerid"], callback, function() {
                callback(200, "OK");
           },function() {
                callback(400, "Player is not in the watchlist")
        })
    })
};



function removePlayer(userTeamID,leagueID,playerID, callback, acceptcallback, deniedCallback){
    var sql = "DELETE FROM Watchlist WHERE userTeamID="+aux.connection.escape(userTeamID)
            +" AND leagueID="+aux.connection.escape(leagueID)
            + "AND playerID ="+aux.connection.escape(playerID);

    aux.connection.query(sql, function(err) {
        if(err)
        {
            if(err["code"] == 'a') //TODO:Må sette denne lik koden den får hvos raden ikke fins.
            {
                deniedCallback();
            }
            else {
                aux.onError(err,callback);
            }
        }
        else {
            acceptcallback();
        }
    })

}
