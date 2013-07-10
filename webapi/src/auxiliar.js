// A MySQL connection for all services
var mysql      = require('mysql');

/*
exports.connection = mysql.createConnection({
    host: '192.168.10.105',
    user: 'roar',
    password: '123',
    database: 'mydb'
});
*/


exports.connection = mysql.createConnection({
    host: 'localhost',
    user: 'node',
    password: '123',
    database: 'mydb'
});

exports.authenticate = function (params) {
    var header = params['authorization']||'',
        token=header.split(/\s+/).pop()||'',            // and the encoded auth token
        auth=new Buffer(token, 'base64').toString(),    // convert from base64
        parts=auth.split(/:/),                          // split on colon
        username=parts[0],
        password=parts[1];

    var result =
    {
        username: username,
        password: password
    };
    return result;
}

exports.loginFromParams = function (params) {
    var auth = this.authenticate(params);
    return this.loginWithUserPw(auth["username"],auth["password"]);
};

exports.loginWithUserPw = function (username,password) {
    var sql = "SELECT * FROM User WHERE username="+aux.connection.escape(username)+" AND password="+aux.connection.escape(password);
    this.connection.query(sql, function(err, rows) {
        if(err){ return false; }
        if(rows === undefined) { return false; }
        else if(rows.length == 1) {return true;}
        else { return false;}
    });
};
// Error reporting

exports.onError = function(err, callback) {
  console.error("UNEXPECTED ERROR " + err);
  console.error("STACK", err.stack);
  return callback(500, "UNEXPECTED INTERNAL ERROR");
}