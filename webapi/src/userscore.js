var detailedScore = require("./userteam/userTeamDetailedScore");

var getDetailedScore = function (params, callback) {
    detailedScore.main(params, callback);
};


exports.dispatch = {
    GET:    getDetailedScore
};