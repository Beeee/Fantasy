var getTeam = function(params,callback) {
    return callback(200, "OK");
};

var substitutePlayer = function(params,callback) {
    return callback(200, "OK");
};

var createTeam = function(params,callback) {
    return callback(200, "OK");
};

var deleteTeam = function(params,callback) {
    var allowHeader = {Allow: "GET, PUT, POST"}
    return callback(405, "Method Not Allowed",allowHeader);
};

exports.dispatch = {
    GET:    getTeam,
    PUT:    substitutePlayer,
    POST:   createTeam,
    DELETE: deleteTeam
};