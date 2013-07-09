var getUsers = function(params,callback) {
	var result =
	{
	username: params["username"],
	epost: params["mail"]
	};
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


var authentication = function(params,callback) {
	var result = authenticate(params);
	  console.log(result);
	  return callback(200, "OK", {}, result);
}

var authenticate = function (params) {
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

exports.dispatch = {
  GET:    getUsers,
  PUT:    changePassword,
  POST:   addNewUser,
  DELETE:   deleteUser,
};