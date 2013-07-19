var subs = require("./userteam/substitution")
var availablePlayers = require("./userteam/available_players")
var helpers = require("./team_helpers")
var makeSubstitution = function(params,callback) {
    subs.main(params,callback);
};

var getAvailablePlayers = function(params,callback) {
    availablePlayers.main(params,callback);
};

var testFunction = function(params,callback) {
    helpers.getTeam(1,1,callback, function(team) {
        console.log(team);
    });
};



exports.dispatch = {
   GET:    getAvailablePlayers,
   PUT:    makeSubstitution,
   POST:   testFunction
//    DELETE: deleteTeam
};
