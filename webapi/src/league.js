var getLeagueInformation = function(params,callback) {
    return callback(200, "OK", {}, {});
};

var addTeam = function(params,callback) {
    return callback(200, "OK", {}, {});
};

var createLeague = function(params,callback) {
    return callback(200, "OK", {}, {});
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