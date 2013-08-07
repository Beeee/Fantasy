/**
 * Created with JetBrains WebStorm.
 * User: Roar
 * Date: 01.08.13
 * Time: 18:04
 * To change this template use File | Settings | File Templates.
 */

var aux = require("./auxiliar")

exports.makeTransferSQL = function(newplayerID, oldPlayerID, userTeamID, gameWeekNumber, callback, acceptCallback) {
    var sql = "UPDATE GameweekTeam_has_Player SET playerID="+aux.connection.escape(newplayerID)+
        " WHERE userTeamID="+ aux.connection.escape(userTeamID)+ " AND gameWeekNumber="+gameWeekNumber
        +" AND playerID="+aux.connection.escape(oldPlayerID);

    aux.connection.query(sql, function(err) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else
        {
            acceptCallback();
        }
    });
};

exports.getPlayersInformation = function(players, callback, acceptCallback) {
      var sql = "" //TODO

}