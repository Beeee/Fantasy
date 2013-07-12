var aux = require("./auxiliar");

var getLeagueInformation = function(params,callback) {
    return callback(200, "OK");
};

var addTeam = function(params,callback) {
    return callback(200, "OK");
};

var createLeague = function(params,callback) {
    var auth = aux.authenticate(params);
    aux.loginWithUserPw(auth["username"],auth["password"], function() {
        if(params["name"] === undefined)
        {
            return callback(400, "Bad Request");
        }
        var sql = "INSERT INTO UserLeague SET ?";
        var data = {
            "name": params["name"],
            "admin": auth["username"]
        }
        aux.connection.query(sql, data, function(err) {
            if(err) {  aux.onError(err, callback);  }
            else {

 //               var updateUserTeamSQL = "UPDATE UserTeam, User SET leagueID"=1 WHERE UserTeam.userTeamID=User.userTeamID AND User.username="ingulf2"
                callback(202, "Accepted");

            }
        });
    },
        function() {
        return aux.unauthorized(callback);
    });
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