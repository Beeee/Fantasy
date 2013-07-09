var getUsers = function(params,callback) {
    var result =
    {
        username: params["username"],
        epost: params["mail"]
    };
    return callback(200, "OK", {}, result);
};

exports.dispatch = {
    GET:    getUsers
};