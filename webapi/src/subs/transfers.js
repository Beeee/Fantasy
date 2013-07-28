var aux = require("./../auxiliar");
var teamHelpers = require("./../team_helpers");
var subHelper = require("./substitution_helpers");


exports.main = function(params, callback) {
    var auth = aux.authenticate(params);
    var subIn = params["in"];
    var subOut = params["out"];
    var gameweekNumber = 1;
    console.log(params);

    subHelper.isValidSubstition(auth, subIn, subOut, gameweekNumber, callback, function() {

    },
    function() {

    });
};
