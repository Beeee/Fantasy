var aux = require("./auxiliar");

var getUsers = function(params,callback) {
    aux.connection.query('SELECT username, mail FROM User', function(err, rows) {
      var result = [];
        for (var i in rows) {
            result[i] = {
                username: rows[i]["username"],
                email: rows[i]["mail"]
            };
        }
        return callback(200, "OK", {}, result);
    });
};

exports.dispatch = {
    GET:    getUsers
};