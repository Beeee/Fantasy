// A MySQL connection for all services
var mysql = require('mysql');
var constants = require('./constants');

/*
exports.connection = mysql.createConnection({
    host: '192.168.10.105',
    user: 'roar',
    password: '123',
    database: 'mydb'
});
*/


exports.connection;

exports.setUpConnection = function() {

    console.log("Inn i setUpConnection")
    var db_config = {
        host: 'localhost',
        user: 'node',
        password: '123',
        database: 'mydb'
    }
    this.connection = mysql.createConnection(db_config);

    this.connection.connect(function(err) {
        if(err) {
            console.log('error when connecting to db:', err);
            setTimeout(this.setUpConnection, 2000);
        }
    });

    this.connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log("inn her")// Connection to the MySQL server is usually
            require('./auxiliar').setUpConnection();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                 // server variable configures this)
        }
    });
}


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


exports.loginFromParams = function (params, allowCallback, deniedCallback) {
    var auth = this.authenticate(params);
    return this.loginWithUserPw(auth["username"],auth["password"], allowCallback, deniedCallback);
};

exports.setGameWeekConstant = function() {
    var sql = "SELECT * FROM GameWeek";
    this.connection.query(sql, function(err, rows){
        if(err || rows === undefined || rows.length != 1) {
            console.log("CRITICAL ERROR: COULD NOT GET GAMEWEEKNR");
            if(err) {
                console.log(err);
            }
        }
        else {
            constants.GAMEWEEKNUMBER = rows[0]["gameWeekGlobal"];
        }
    })

};

exports.loginWithUserPw = function (username,password, allowCallback, deniedCallback) {
    var sql = "SELECT * FROM User WHERE username="+this.connection.escape(username)+" AND password="+this.connection.escape(password);
    return this.connection.query(sql, function(err, rows) {
        if(err){
           deniedCallback();
        }
        if(rows ===  undefined) {
            deniedCallback();
        }
        else if(rows.length == 1) {
            allowCallback();
        }
        else{
            deniedCallback();
        }
    });
};

exports.unauthorized = function(callback)
{
    return callback(401, "Unauthorized");
}

// Error reporting

exports.onError = function(err, callback) {
  console.error("UNEXPECTED ERROR " + err);
  console.error("STACK", err.stack);
  return callback(500, "UNEXPECTED INTERNAL ERROR");
}