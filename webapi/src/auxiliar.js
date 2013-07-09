// A MySQL connection for all services

exports.conn = require('mysql').createConnection({
  user:     "fkereki_user",
  password: "fkereki_pass",
  database: "world"
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


// Error reporting

exports.onError = function(err, callback) {
  console.error("UNEXPECTED ERROR " + err);
  console.error("STACK", err.stack);
  return callback(500, "UNEXPECTED INTERNAL ERROR");
}