var aux = require("./auxiliar");

var getLeagueInformation = function(params,callback) {
    return callback(200, "OK");
};

var addTeam = function(params,callback) {
    return callback(200, "OK");
};

var createLeague = function(params,callback) {
    if(aux.loginWithUserPw(params)){
        if(params["name"] === undefined) { return callback(400, "Bad Request"); }
        var sql = "INSERT INTO UserLeague SET ?";
        var data = {
            "name": params["name"]
        }
        aux.connection.query(sql, data, function(err) {
            if(err) { return aux.onError(err, callback);  }
            else { return callback(202, "Accepted"); }
        });
    }
    else { return callback(401, "Unauthorized");  }
};

var removeTeam = function(params,callback) {
    return callback(200, "OK", {}, {});
};

exports.dispatch = {
    GET:    getLeagueInformation,
    PUT:    addTeam,
    POST:   createLeague,
    DELETE:   removeTeam
};