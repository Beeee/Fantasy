var aux = require("./../auxiliar");
var teamHelpers = require("./../team_helpers");
var constants = require("./../constants")

exports.main = function(params, callback) {
    var auth = aux.authenticate(params);
    var subIn = params["in"];
    var subOut = params["out"];
    if(subIn == subOut) {
        return callback(403, "INVALID SUBSTITUTION");
    }
    var gameweekNumber = constants.GAMEWEEKNUMBER;
    aux.loginWithUserPw(auth["username"],auth["password"],function() {
        teamHelpers.getUserTeamIDFromUsername(auth["username"],callback,function(userTeamID) {
            teamHelpers.getTeam(userTeamID,gameweekNumber,callback,function(team) {
                var count = teamHelpers.countPlayingTeam(team);
                teamHelpers.getPlayerPosition(subIn,callback, function(inPosition) {
                    teamHelpers.getPlayerPosition(subOut,callback, function(outPosition) {
                        count[translate(inPosition)]++;
                        count[translate(outPosition)]--;
                        if(teamHelpers.isValidPlayingTeam(count)) {
                                var counter = 0;
                            updateSubstituteSQL(userTeamID,gameweekNumber,subIn,0,callback, function() {
                                counter++;
                                if(counter == 2) {
                                    callback(202, "ACCEPTED");
                                }
                            });
                            updateSubstituteSQL(userTeamID,gameweekNumber,subOut,1,callback, function() {
                                counter++;
                                if(counter == 2) {
                                    callback(202, "ACCEPTED");
                                }
                            });
                        }
                        else{
                            callback(403, "INVALID SUBSTITUTION");
                        }
                    });
                });
            });
        });
    });
};

function translate(position) {
    if(position == "keeper") {
        return "keepers";
    }
    if (position == "defender"){
        return "defenders";
    }
    if(position == "forward") {
        return "forwards";
    }
    if(position == "midfielder") {
        return "midfielders";
    }
};


function updateSubstituteSQL(userTeamID, gameWeekNumber,playerID,value,callback,acceptCallback) {
    var sql = "UPDATE GameweekTeam_has_Player SET substitute="+aux.connection.escape(value)+
        " WHERE userTeamID="+ aux.connection.escape(userTeamID)+ " AND gameWeekNumber="+gameWeekNumber
    +" AND playerID="+aux.connection.escape(playerID);
    aux.connection.query(sql, function(err) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else
        {
            acceptCallback();
        }
    });

};






