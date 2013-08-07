
var aux = require("./../auxiliar")
var helpers = require("./../team_helpers")

exports.main = function(params,callback) {
    if(params["playerid"] === undefined) {
        return callback(400, "Bad request");
    }
     var auth = aux.authenticate(params);

    aux.loginWithUserPw(auth["username"], auth["password"], function(){
        helpers.getuserTeamIDAndLeagueID(auth["username"], callback, function(userTeamID,leagueID) {
           insertIntoWatchList(userTeamID,leagueID,params["playerid"],callback,function() {
               callback(202, "ACCEPTED");
           })
        })
    }, function() {
        aux.unauthorized(callback);
    })
};

function insertIntoWatchList(userTeamID,leagueID,playerID,callback, acceptCallback) {
    var sql = "INSERT INTO Watchlist SET"
        +" userTeamID="+ aux.connection.escape(userTeamID)
        +" ,leagueID="+aux.connection.escape(leagueID)
        +" ,playerID="+aux.connection.escape(playerID);
    aux.connection.query(sql, function(err) {
       if(err) {
           aux.onError(err,callback);
       }
       else {
           acceptCallback();
       }
    });
}

