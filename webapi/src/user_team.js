var getTeam = function(params,callback) {
    return callback(200, "OK", {}, {});
};

var substitutePlayer = function(params,callback) {
    return callback(200, "OK", {}, {});
};

var createTeam = function(params,callback) {
    return callback(200, "OK", {}, {});
};

exports.dispatch = {
    GET:    getTeam,
    PUT:    substitutePlayer,
    POST:   createTeam
};