var aux = require("./../auxiliar");
var teamHelpers = require("./../team_helpers");
var constants = require("./../constants")
var transferHelpers = require("./../transfer_helpers")


exports.main = function(params, callback) {
    var auth = aux.authenticate(params);
    var subIn = params["in"];
    var subOut = params["out"];
    if(subIn == subOut) {
        return callback(403, "INVALID SUBSTITUTION");
    }
    aux.loginWithUserPw(auth["username"],auth["password"],function() {
        teamHelpers.getuserTeamIDAndLeagueID(auth["username"],callback, function(userTeamID,leagueID) {
                teamHelpers.getPlayerPosition(subIn,callback, function(inPosition) {
                    teamHelpers.getPlayerPosition(subOut,callback, function(outPosition) {
                        if(inPosition != outPosition) {
                            return callback(403, "INVALID SUBSTITUTION");
                        }
                        teamHelpers.checkIfPlayerIsAvailableInTheLeague(leagueID, subIn,constants.GAMEWEEKNUMBER,callback ,function() {
                            transferHelpers.makeTransferSQL(subIn,subOut,userTeamID, constants.GAMEWEEKNUMBER,callback, function() {
                                callback(202, "ACCEPTED");
                            });
                        });
                    });
                });
        });
    });
};


