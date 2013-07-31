var aux = require("./../auxiliar.js");
var helpers = require("./../team_helpers");

exports.main = function(params, callback, acceptCallback) {
    var auth = aux.authenticate(params);
    aux.loginWithUserPw(auth["username"],auth["password"], function() {
         helpers.adminCheck(auth["username"], callback,function(leagueID) {
             helpers.isLeagueLocked(leagueID,callback,function(){
                    return callback(400, "The league is already started");
             }, function() {
                  getTeamsInLeague(leagueID,function(err) {
                      return aux.onError(err,callback);
                  },function(leaguePlayers) {
                      generateDraftOrder(leaguePlayers,leagueID,function(data){
                          setFinal(leagueID,1, callback, function(){
                            insertIntoDraftOrder(data,function(err) {
                                aux.onError(err,callback);
                                setFinal(leagueID,0, callback, function(){
                                    callback(500, "Internal server error");
                                });
                            }, function() {
                                acceptCallback();
                         });

                      });
                  });
              });
         });
    });
    },function() {
        aux.unauthorized(callback);
    });
};

function generateDraftOrder(players, leagueID, acceptCallback) {
    var randomArray = shuffle(players);
    var length = randomArray.length
    var counter = 1;
    var result = [];
    for(var i = 0; i < 16; i++) {
        if(i%2 == 0){
            for(var j=0; j < players.length; j++){
                var data = [randomArray[j], leagueID,0,counter];
                result.push(data);
                counter++;
            }
        }
        else {
            for(var j=length-1; 0 <= j; j--){
  /*              var data = {
                    "userTeamID":randomArray[j],
                    "leagueID": leagueID,
                    "active": 0,
                    "number": counter
                }
                */
                var data = [randomArray[j], leagueID,0,counter];
                result.push(data);
                counter++;
            }
        }
    }
    acceptCallback(result)
};

function insertIntoDraftOrder(data,errorCallback, acceptCallback) {
    var sql = "INSERT INTO DraftOrder(userTeamID,leagueID,active,number) VALUES ?";
    aux.connection.query(sql,[data],function(err) {
        if(err) {
           errorCallback(err);
        }
        else {
            acceptCallback();
        }
    })
};

function shuffle(array) {
    var currentIndex = array.length
        , temporaryValue
        , randomIndex
        ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function getTeamsInLeague(leagueID, errorCallback, acceptCallback) {
    var sql = "SELECT teamID FROM leagueView WHERE leagueID="+aux.connection.escape(leagueID);
    aux.connection.query(sql, function(err, rows) {
        if(err) {
            errorCallback(err)
        }
        else{
            var result = [];
            for(var i = 0; i< rows.length; i++) {
                result.push(rows[i]["teamID"]);
            }
            acceptCallback(result);
        }
    });
};

function setFinal(leagueID, value, callback, acceptCallback ){
    var sql = "UPDATE UserLeague SET final="+aux.connection.escape(value)+" WHERE leagueID="+aux.connection.escape(leagueID);
    aux.connection.query(sql, function(err) {
         if(err) {
             aux.onError(err,callback);
         }
         else{
             acceptCallback();
         }
    });
};