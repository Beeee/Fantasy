var getTeamInformation = function(params,callback) {
    return callback(200, "OK", {}, {});
};

exports.dispatch = {
    GET:    getTeamInformation
};
