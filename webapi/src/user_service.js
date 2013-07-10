var aux = require("./auxiliar");

var login = function(params,callback) {
    var auth = aux.authenticate(params);
    if(auth["username"] === undefined || auth["password"] === undefined)
    {
        return callback(401, "Unauthorized", {}, {});
    }
    var sql = "SELECT * FROM User WHERE userName="+aux.connection.escape(auth["username"])+" AND password="+aux.connection.escape(auth["password"]);
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            return aux.onError(err, callback);
        }
        if(rows === undefined)
        {
            return callback(401, "Unauthorized", {}, {});
        }
        if(rows.length == 1) {
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