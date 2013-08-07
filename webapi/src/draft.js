var draft = require("./draft/createDraftOrder")
var startDraft = require("./draft/startdrafting")
var getDraftOrderImport = require("./draft/getDraftOrder")

var getDraftOrder = function(params,callback) {
    var username = "";
    if(params['authorization'] !== undefined) {
        var auth = aux.authenticate(params);
        username = auth["username"];
    }
    else if(params["username"] !== undefined) {
        username = params["username"];
    }
    else{
        return callback(400, "Bad Request");
    }
    return getDraftOrderImport.main(username,callback);
};

var startDrafting = function(params,callback) {
    return startDraft.main(params,callback);
};
var createDraftOrder = function(params,callback) {
    return draft.main(params,callback, function(){
        callback(202, "Accepted");
    });
};

var deleteTeam = function(params,callback) {
    var allowHeader = {"Allow": "GET, PUT, POST"};
    return callback(405, "Method Not Allowed",allowHeader);
};

exports.dispatch = {
    GET:    getDraftOrder,
    PUT:    startDrafting,
    POST:   createDraftOrder,
    DELETE: deleteTeam
};
