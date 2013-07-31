
var aux = require("./../auxiliar");
var teamHelpers = require("./../team_helpers");

exports.main = function(username, callback) {
    teamHelpers.getLeagueIDFromUsername(username,callback,function(leagueID) {
        getDraftOrder(leagueID,callback,function(draftOrder) {
             callback(200, "OK", {}, draftOrder);
        })
    });
};

function getDraftOrder(leagueID, callback, acceptCallback) {
    var sql = "SELECT * FROM mydb.draftView WHERE leagueID="+aux.connection.escape(leagueID);

    aux.connection.query(sql, function(err, rows) {
        if(err) {
            aux.onError(err,callback);
        }
        else if(rows.length == 0) {
            callback(400, "Drafting has not started");
        }
        else{
            acceptCallback(rows);
        }
    });
}