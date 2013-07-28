var aux = require("./../auxiliar");
var teamHelpers = require("./../team_helpers");

exports.isValidSubstition = function(auth,subIn,subOut,gameWeeknr,callback,acceptCallback, deniedCallback) {
    aux.loginWithUserPw(auth["username"],auth["password"],function() {
        teamHelpers.getUserTeamIDFromUsername(auth["username"],callback,function(userTeamID) {
            teamHelpers.getTeam(userTeamID,gameWeeknr,callback,function(team) {
                var count = teamHelpers.countTeamPosition(team);
                console.log(count);
                teamHelpers.getPlayerPosition(subIn,callback, function(inPosition) {
                    console.log(inPosition)
                    teamHelpers.getPlayerPosition(subOut,callback, function(outPosition) {
                        console.log(outPosition)
                        count[translate(inPosition)]--;
                        count[translate(outPosition)]++;
                        console.log(count);
                        if(teamHelpers.isValidPlayingTeam(count)) {
                            acceptCallback(userTeamID);
                        }
                        else{
                            deniedCallback();
                        }
                    });
                });
            });
        });
    });
}

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
}