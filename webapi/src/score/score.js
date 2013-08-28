var aux = require("./../auxiliar");

exports.getOverallLeagueScore = function(leagueID,callback) {
    getOverAllScoreSQL(leagueID,callback, function(leagueScore) {
        callback(200, "OK", {}, leagueScore);
    });
};


function getOverAllScoreSQL(leagueID, callback, acceptCallback)  {
    var sql = "SELECT * FROM mydb.leagueScoreWithEmptyFields " +
        "WHERE leagueID="+aux.connection.escape(leagueID)+ " ORDER BY leagueScore DESC";
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else if(rows === undefined || rows.length == 0)
        {
            callback(400, "The leagueID does not exist")
        }
        else {
            acceptCallback(rows);
        }
    });
};

exports.getGameweekLeagueScore = function(leagueID,gameWeekNumber, callback) {
    getGameWeekScoreSQL(leagueID,gameWeekNumber,callback, function(leagueScore) {
        callback(200, "OK", {}, leagueScore);
    });
};

function getGameWeekScoreSQL(leagueID,gameWeekNumber,callback, acceptCallback) {
    var sql ="SELECT * FROM mydb.userGameWeekScoresIncludeEmpty WHERE leagueID="+aux.connection.escape(leagueID)+" " +
        "AND gameWeekNumber="+aux.connection.escape(gameWeekNumber) +" " +
        "ORDER BY Score DESC";
    console.log(sql);
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else if(rows === undefined || rows.length == 0)
        {
            callback(400, "The team has no points in this gameweek")
        }
        else {
            acceptCallback(rows);
        }
    });
};