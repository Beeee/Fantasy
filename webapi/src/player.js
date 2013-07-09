var getPlayerInformation = function(params,callback) {
    return callback(200, "OK", {}, {});
};

exports.dispatch = {
    GET:    getPlayerInformation
};
