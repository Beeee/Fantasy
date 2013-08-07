var aux = require("./../auxiliar")
var teamHelpers = require("./../team_helpers")

exports.main = function(params,callback) {
        if(params["playersOut"] === undefined ) {
            return callback(400, "Bad request");
        }
        if(params["playersIn"] === undefined ) {
            return callback(400, "Bad request");
        }
        var opponent = params["username"];

       var playersOut = createPlayersList(params["playersOut"])
       var playersInn = createPlayersList(params["playersInn"])
       teamHelpers.loginGetUserNameANDuserTeamIDAnduserLeagueIDWithOutCallback(params,callback,
           function(username,userTeamID,leagueID) {
               //Det er kanskje bedre å gjøre denne utregninga på serveren, for å lette mysql trykket?
               // ny plan: Hente ut spillerne, med lag, username, og posisjon

           });

    /*
        1. logg inn
        2. sjekk om det er hans spillere
            1. hente usertTeamID
            2. sjekk om laget har spillerne
        3. sjekk om sjekk om motstanderne har alle motstanderspillerne
        4. sjekk om posisjon = posjson
        4. legg til i databasen

     */

};

function createPlayersList(playersString) {
   return playersString.split("-");
}
