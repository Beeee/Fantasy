var aux = require("./auxiliar");

var login = function(params,callback) {
    var auth = aux.authenticate(params);
    if(auth["username"] === undefined || auth["password"] === undefined)
    {
        return callback(401, "Unauthorized", {}, {});
    }
    aux.connection.query("SELECT * FROM User WHERE userName='"+auth["username"]+"' AND password="+auth["password"], function(err, rows) {
        if(rows.length == 1)
        {
            return callback(202, "Accepted", {}, {});
        }
        else
        {
            return callback(401, "Unauthorized", {}, {});
        }
    });
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