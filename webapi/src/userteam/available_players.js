/**
 * Created with JetBrains WebStorm.
 * User: Roar
 * Date: 19.07.13
 * Time: 13:21
 * To change this template use File | Settings | File Templates.
 */
var aux = require("./../auxiliar");
var teamHelpers = require("./../team_helpers");

exports.mainWithAuth = function(params,callback) {
    aux.loginWithUserPw(auth["username"],auth["password"],function() {
        teamHelpers.getLeagueIDFromUsername(auth["username"],callback, function(leagueID) {
            listAvailablePlayersFromLeagueIDSQL(leagueID,callback, function(list) {
                  callback(202, "ACCEPTED", {},list);
            });
        });
    }, function() {
            aux.unauthorized(callback);
        }
    );

};

exports.main = function(params,callback) {
    teamHelpers.getLeagueIDFromUsername(params["username"],callback, function(leagueID) {
         listAvailablePlayersFromLeagueIDSQL(leagueID,callback, function(list) {
                 callback(202, "ACCEPTED", {},list);
               });
       });

};

function listAvailablePlayersFromLeagueIDSQL(leagueID,callback,acceptCallback){
   var sql = "SELECT p.playerID, p.name AS playername, p.position, RealTeam.name AS teamname, p.realTeamID FROM Player p, RealTeam WHERE NOT EXISTS ( SELECT playerID FROM playerInformation pi WHERE p.playerID = pi.playerID AND leagueID="+aux.connection.escape(leagueID)+")" +
       " AND RealTeam.idrealTeam=p.realTeamID"
    aux.connection.query(sql, function(err,rows) {
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