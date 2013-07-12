var aux = require("./auxiliar");

var login = function(params,callback) {
    var auth = aux.authenticate(params);
    if(auth["username"] === undefined || auth["password"] === undefined)
    {
        return callback(401, "Unauthorized", {}, {});
    }
    var sql = "SELECT * FROM User WHERE username="+aux.connection.escape(auth["username"])
        +" AND password="+aux.connection.escape(auth["password"]);
    return aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            return aux.onError(err, callback);
        }
        if(rows === undefined)
        {
            return callback(401, "Unauthorized");
        }
        else if(rows.length == 1) {
            return callback(202, "Accepted");
        }
        else
        {
            return callback(401, "Unauthorized");
        }
    });
};

function sqlChangePassword(auth,params,callback) {
    var sql = "UPDATE User SET password="+aux.connection.escape(params["password"])
        +" WHERE username="+aux.connection.escape(auth["username"]) +
        "AND password="+aux.connection.escape(auth["password"]);
    return aux.connection.query(sql, function(err, result) {
        if(err)
        {
            return aux.onError(err, callback);
        }
        if (result.affectedRows)
        {
            return callback(204, "UPDATED");
        }
        else
        {
            return callback(409, "COULDN'T UPDATE PASSWORD");
        }
    });
};

var changePassword = function(params,callback) {
    var auth = aux.authenticate(params);
    aux.loginWithUserPw(auth["username"],auth["password"], function(){
        return sqlChangePassword(auth,params,callback);
    },
        function(){
           return aux.unauthorized(callback);
        }
    );
};

var addNewUser = function(params,callback) {
    if(params["name"] === undefined ||
       params["username"] === undefined ||
       params["password"]=== undefined ||
       params["mail"] === undefined)
    {
        return callback(400, "Bad Request");
    }
    var sql = "INSERT INTO User SET ?";
    var data = {
        "name": params["name"],
        "username": params["username"],
        "password": params["password"],
        "mail":params["mail"]
    }
    aux.connection.query(sql, data, function(err) {
       if(err) {
           if(err["code"] === 'ER_DUP_ENTRY') {
              return callback(403, "USERNAME ALREADY EXISTS");
           }
           else {
               return aux.onError(err, callback);
           }
       }
       else
       {
           return callback(202, "Accepted");
       }
    });
};

var deleteUser = function(params,callback) {
    var allowHeader = {Allow: "GET, PUT, POST"}
    return callback(405, "Method Not Allowed", allowHeader);
};

exports.dispatch = {
  GET:    login,
  PUT:    changePassword,
  POST:   addNewUser,
  DELETE: deleteUser
};