var helpers = require("./../team_helpers")
var aux = require("./../auxiliar")

exports.main = function(params,callback) {
    helpers.loginGetUserNameANDuserTeamIDAnduserLeagueIDWithOutCallback(params,callback,
        function(username,userTeamID,leagueID){

    })
};


function getWatchList(userTeamID, leagueID, callback, acceptCallback) {
    //TODO: Skriv!
};