var aux = require("./auxiliar");

getGameWeeksInformation = function(params,callback) {
    var sql = "SELECT * FROM mydb.GameWeekRounds"
    if(params["gameWeekNumber"] !== undefined)
    {
        sql = sql+" WHERE gameWeekNumber="+aux.connection.escape(params["gameWeekNumber"]);
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
    GET:    getGameWeeksInformation
};