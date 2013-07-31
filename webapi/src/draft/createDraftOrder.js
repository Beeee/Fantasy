var aux = require("./../auxiliar.js");
var helpers = require("./../team_helpers");

exports.main = function(params, callback) {
    var auth = aux.authenticate(params);
    //1.
    aux.loginWithUserPw(auth["username"],auth["password"], function() {
         helpers.adminCheck(auth["username"], callback,function(leagueID) {

         });
    });
};

function generateDraftOrder(players, leagueID,callback, acceptCallback) {

};

function getTeamsInLeague() {

}