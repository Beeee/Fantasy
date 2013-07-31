var aux = require("./../auxiliar.js");
var helpers = require("./../team_helpers");
var createDraftOrder = require("./createDraftOrder");

exports.main = function(params, callback) {
    var auth = aux.authenticate(params);
    aux.loginWithUserPw(auth["username"],auth["password"], function() {
        helpers.adminCheck(auth["username"], callback, function(leagueID) {
               helpers.isLeagueLocked(leagueID,callback,function() {
                    activateDraftingInTheDatabase(leagueID,callback, function(){
                        callback(202,"Accepted");
                    });
               }, function() {
                  createDraftOrder.main(params,callback, function() {
                      activateDraftingInTheDatabase(leagueID,callback, function(){
                          callback(202,"Accepted");
                      });
                  });
            });
        });
    }, function() {
        aux.unauthorized(callback);
    });
};

function activateDraftingInTheDatabase(leagueID, callback, accepctCallback) {
        setDraftIsActive(leagueID,function(error){
            return aux.onError(error,callback);
        }, function() {
             setActiveDraftPlayer(leagueID,function(error) {
                 aux.onError(error,callback);
                 setDraftInactive(leagueID,function(err){}, function(){});
             },function(){
                 accepctCallback();
             });
        });
};

function setDraftIsActive(leagueID, errorCallback, acceptCallback) {
     return setDraft(leagueID,1,errorCallback,acceptCallback);
};

function setDraftInactive(leagueID,errorCallback,acceptCallback) {
    setDraft(leagueID,0,errorCallback,acceptCallback);
}

function setDraft(leagueID,value, errorCallback, acceptCallback) {
    var sql = "UPDATE UserLeague SET " +
        "draftIsActive="+ aux.connection.escape(value) +
        " WHERE leagueID="+aux.connection.escape(leagueID);
    aux.connection.query(sql, function(err) {
        if(err) {
            errorCallback(err);
        }
        else {
            acceptCallback();
        }
    })
};

function setActiveDraftPlayer(leagueID,errorCallback, acceptCallback) {
    var sql = "UPDATE DraftOrder SET active=1 WHERE leagueID="+aux.connection.escape(leagueID)+" AND number= 1";
    aux.connection.query(sql, function(err) {
     if(err) {
         errorCallback(error);
     }
        else{
         acceptCallback();
     }
    });

}

