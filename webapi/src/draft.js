/**
 * Created with JetBrains WebStorm.
 * User: Roar
 * Date: 30.07.13
 * Time: 19:14
 * To change this template use File | Settings | File Templates.
 */

var getDraftOrder = function(params,callback) {
    var allowHeader = {"Allow": "GET, PUT, POST"};
    return callback(405, "Method Not Allowed",allowHeader);
};
var makeSubstitution = function(params,callback) {
    var allowHeader = {"Allow": "GET, PUT, POST"};
    return callback(405, "Method Not Allowed",allowHeader);
};
var createDraftOrder = function(params,callback) {

    var allowHeader = {"Allow": "GET, PUT, POST"};
    return callback(405, "Method Not Allowed",allowHeader);
};


var deleteTeam = function(params,callback) {
    var allowHeader = {"Allow": "GET, PUT, POST"};
    return callback(405, "Method Not Allowed",allowHeader);
};

exports.dispatch = {
    GET:    getDraftOrder,
    PUT:    makeSubstitution,
    POST:   createDraftOrder,
    DELETE: deleteTeam
};
