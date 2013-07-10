var aux = require("./auxiliar");

var getUsers = function(params,callback) {
    aux.connection.query('SELECT userName, eMail FROM User', function(err, rows) {
      var result = [];
        for (var i in rows) {
            result[i] = {
                username: rows[i]["userName"],
                email: rows[i]["eMail"]
            };
        }
        return callback(200, "OK", {}, result);
    });
};

exports.dispatch = {
    GET:    getUsers
};