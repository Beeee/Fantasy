var teamHelpers = require("./../team_helpers");
var aux = require("./../auxiliar");
var constants = require("./../constants");


exports.pickPlayer = function pickPlayer(userTeamID,leagueID,gameWeekNumber,playerID,callback, acceptCallback){
    teamHelpers.checkIfPlayerIsAvailableInTheLeague(leagueID,playerID,gameWeekNumber,callback, function() {
        teamHelpers.getTeam(userTeamID,gameWeekNumber,callback,function(team){
            checkPlayerAvail(team, playerID,callback,function() {
                insertPlayer(userTeamID,playerID,gameWeekNumber,callback, function() {
                    teamHelpers.getTeam(userTeamID,gameWeekNumber,callback, function (newTeam) {
                        if(newTeam.length == 16) {

                            setUpTeam(newTeam);
                        }
                        acceptCallback();
                    });
                });
            });
        });
    });
};

function checkPlayerAvail(team,playerID, callback, acceptCallback) {

    var count = teamHelpers.countTeamPosition(team);
    teamHelpers.getPlayerPosition(playerID,callback, function(position){
        if(teamHelpers.positionIsNotFull(position,count)){
            acceptCallback();
        }
        else
        {
            callback(403, "POSITION FULL");
        }
    });
};

function insertPlayer(userTeamID,playerID,gameweekNumber,callback, acceptCallback) {
    var sql = "INSERT INTO GameweekTeam_has_Player SET ?";
    var data =
    {
        "userTeamID": userTeamID,
        "gameWeekNumber": gameweekNumber,
        "playerID": playerID,
        "substitute": 0
    }
    aux.connection.query(sql, data, function(err) {
        if(err)
        {
            return aux.onError(err, callback);
        }
        else
        {
            acceptCallback();
        }
    });
};


function setUpTeam(team) {
    var playerIDlist = [];
    var keeper = false;
    var defender = false;
    var defender2 = false
    var midfielder = false;
    var forward = false;
    var userTeamID = team[0]["userTeamID"];

    for(var i in team) {
        if(team[i]["position"] == "keeper" && keeper == false) {
            keeper = true;
            playerIDlist.push(team[i]["playerID"]);
        }
        if(team[i]["position"] == "defender" && (defender == false || defender2 == false)) {
            if(!defender) {
                defender = true;
                playerIDlist.push(team[i]["playerID"]);
            }
            else if(!defender2)
            {
                defender2 = true;
                playerIDlist.push(team[i]["playerID"]);
            }
            else {
                //do nothing
            }
        }
        if(team[i]["position"] == "midfielder" && midfielder == false) {
            midfielder = true;
            playerIDlist.push(team[i]["playerID"]);
        }
        if(team[i]["position"] == "forward" && forward == false) {
            forward = true;
            playerIDlist.push(team[i]["playerID"]);
        }
    }

    var sql = "UPDATE GameweekTeam_has_Player SET substitute=1 " +
        "WHERE userTeamID=" +aux.connection.escape(userTeamID)+
        " AND gameWeekNumber="+constants.GAMEWEEKNUMBER +
        " AND (playerID="+aux.connection.escape(playerIDlist[0]) +
        " OR playerID="+aux.connection.escape(playerIDlist[1]) +
        " OR playerID="+aux.connection.escape(playerIDlist[2]) +
        " OR playerID="+aux.connection.escape(playerIDlist[3]) +
        " OR playerID="+aux.connection.escape(playerIDlist[4]) +
        ")";
    aux.connection.query(sql, function(err) {
        if(err)
        {
            console.log(err);
            console.log("Klarte ikke å sette opp subs!! BUG BUG BUG");
        }
    });

};


