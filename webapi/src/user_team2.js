var subs = require("./subs/substitution")
var availablePlayers = require("./userteam/available_players")
var helpers = require("./team_helpers")
var transfers = require("./subs/transfers")

var makeSubstitution = function(params,callback) {
    subs.main(params,callback);
};

var getAvailablePlayers = function(params,callback) {
    availablePlayers.main(params,callback);
};

var subWithPool = function(params,callback) {
    transfers.main(params,callback);
};

var deleteTeam = function(params,callback) {
    var allowHeader = {"Allow": "GET, PUT, POST"};
    return callback(405, "Method Not Allowed",allowHeader);
};

exports.dispatch = {
   GET:    getAvailablePlayers,
   PUT:    makeSubstitution,
   POST:   subWithPool,
   DELETE: deleteTeam
};
