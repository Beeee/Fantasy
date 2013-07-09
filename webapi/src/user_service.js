var aux = require("./auxiliar");

var login = function(params,callback) {
    var result = aux.authenticate(params);
    console.log(result);
    return callback(200, "OK", {}, result);
};

var changePassword = function(params,callback) {
    return callback(200, "OK", {}, {});
};

var addNewUser = function(params,callback) {
    return callback(200, "OK", {}, {});
};

var deleteUser = function(params,callback) {
    return callback(200, "OK", {}, {});
};

exports.dispatch = {
  GET:    login,
  PUT:    changePassword,
  POST:   addNewUser,
  DELETE:   deleteUser
};