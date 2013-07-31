var aux = require("./auxiliar");

var incrementConstant = function(params,callback) {
      var auth = aux.authenticate(params);
      adminLogIn(auth["username"], auth["password"],callback, function(){
          aux.setGameWeekConstant();
           callback(200, "Incrementing was successful");
      });
};

function adminLogIn(username,password,callback,acceptCallback) {
    var sql = "SELECT count(*) AS count FROM mydb.AdministratorTable WHERE" +
        " password="+aux.connection.escape(password)
        +" AND username="+aux.connection.escape(username);
    aux.connection.query(sql, function(err,rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else if(rows === undefined || rows[0]["count"] != 1)
        {
            callback("500", "ACCESS DENIED")
        }
        else {
            acceptCallback();
        }
    });
}

exports.dispatch = {
    GET:    incrementConstant
};
