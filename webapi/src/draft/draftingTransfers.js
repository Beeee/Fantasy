var aux = require("./../auxiliar");
var teamHelpers = require("./../team_helpers");
var playerPicker = require("./../subs/pickPlayer");
var constants = require("./../constants");


/*
1. logge inn
2. finne liga
3. sjekke om drafting er i gang
4. sjekke om bruker er aktiv
5. gjøre bytte
6. flytte token - Hvis det ikke er flere igjen, avslutt festen
7.
 */

exports.main = function(params,callback) {
    if(params["playerid"] === undefined) {
        return callback(400, "playerid undefined");
    }
    var auth = aux.authenticate(params);

    aux.loginWithUserPw(auth["username"],auth["password"], function() {
       teamHelpers.getuserTeamIDAndLeagueID(auth["username"],callback, function(userTeamID,leagueID) {
           console.log(3)
           hasDraftingStarted(leagueID,callback,function(){
                   callback(400, "Drafting has not started");
           }, function() {
               isUsersTurn(leagueID, userTeamID,callback,function(){
                    callback(400, "It is not your turn to pick");
               }, function(number) {
                   playerPicker.pickPlayer(userTeamID,leagueID,constants.GAMEWEEKNUMBER ,params["playerid"],callback,function(){
                       hasNext(leagueID,number,callback,function() {
                           callback(202, "Accepted");
                       }, function() {
                           var counter = 0;
                           updateActiveToOne(leagueID,number+1,function(){
                               callback(500, "Contact system administrator");
                           }, function() {
                               counter++;
                               if(counter == 2) {
                                   callback(200, "Accepted");
                               }

                           });
                           updateActiveToZero(leagueID,number,function(err){
                               aux.onError(err,callback);
                           }, function(){
                               counter++;
                               if(counter == 2) {
                                   callback(200, "Accepted");
                               }
                           })
                       })
                   })

               })
           })
       })
    }, function() {
        aux.unauthorized(callback);
    })
}

function hasDraftingStarted(leagueID, callback, deniedCallback, acceptCallback) {
    var sql = "SELECT draftIsActive FROM UserLeague WHERE leagueID="+aux.connection.escape(leagueID);
    aux.connection.query(sql, function(err, rows) {
        if(err) {
             aux.onError(err, callback);
        }
        else if(rows === undefined || rows.length != 1) {
               deniedCallback();
        }
        else {
            if(rows[0]["draftIsActive"] == "0") {
                deniedCallback();
            }
            else {
                acceptCallback();
            }
        }
    })

}

function isUsersTurn(leagueID, userTeamID,callback,deniedCallback, acceptCallback){
    var sql = "SELECT number FROM DraftOrder WHERE active=1 AND " +
        "userTeamID="+aux.connection.escape(userTeamID)+
        " AND leagueID="+aux.connection.escape(leagueID);
    aux.connection.query(sql, function(err, rows) {
        if(err) {
            aux.onError(err, callback);
        }
        else {
            if(rows === undefined || rows.length != 1) {
                deniedCallback();
            }
            else {
                acceptCallback(rows[0]["number"]);
            }
        }
    })
}

function hasNext(leagueID, number ,callback, draftFinishedCallback, acceptCallback) {
    var sql = "select count(*) as count FROM DraftOrder " +
        "WHERE leagueID ="+ aux.connection.escape(leagueID) +
        " AND number = "+aux.connection.escape(number+1);
    aux.connection.query(sql, function(err, rows) {
             if(err) {
                 return aux.onError(err, callback);
             }
             else {
                 var count = rows["0"]["count"];
                 if(count == "0") {
                     draftFinishedCallback();
                 }
                 else {
                     acceptCallback();
                 }
             }
        });
};

function updateActiveToZero(leagueID,number,deniedCallback,acceptCallback) {
    updateActive(leagueID,number,0,deniedCallback, acceptCallback);
};

function updateActiveToOne(leagueID,number,deniedCallback,acceptCallback) {
    updateActive(leagueID,number,1,deniedCallback, acceptCallback);
};

function updateActive(leagueID, number,value,deniedCallback,acceptCallback) {
    var sql = "UPDATE DraftOrder " +
        "SET active="+aux.connection.escape(value)+
        " WHERE leagueID="+aux.connection.escape(leagueID) +
        " AND number="+aux.connection.escape(number);

    aux.connection.query(sql, function(err, rows) {
        if(err) {
            deniedCallback(err);
        }
        else {
            acceptCallback();

        }
    })
};
