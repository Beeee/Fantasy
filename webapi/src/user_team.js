var aux = require("./auxiliar");

var getTeam = function(params,callback) {
    if(params["gameweek"] === undefined || params["username"] === undefined)
    {
        return callback(400, "Bad Request");
    }
    var sql = "SELECT playerID, playerName, position, substitute  FROM teamsView WHERE "
        +"gameweekNumber="+aux.connection.escape(params["gameweek"])
        +" AND username="+aux.connection.escape(params["username"]);
    return aux.connection.query(sql, function(err, rows) {
        if(err) { return aux.onError(err, callback);  }
        else{
            var result = generateTeamResult(rows);
            return callback(200, "OK", {}, result);
            }
        });
 };

function generateTeamResult(rows) {
    var result =
    {
        "keepers" : [],
        "defenders" : [],
        "midfielders" : [],
        "forwards" : []
    }
    for (var i in rows) {
        var data =
        {
            "playerID": rows[i]["playerID"],
            "playerName": rows[i]["playerName"],
            "substitute": rows[i]["substitute"]
        }
        if(rows[i]["position"] == "keeper") {
            result["keepers"].push(data);
        }
        else if(rows[i]["position"] == "defender") {
            result["defenders"].push(data);
        }
        else if(rows[i]["position"] == "midfielder") {
            result["midfielders"].push(data);
        }
        else {
            result["forwards"].push(data);
        }
    }
    return result;
};


var substitutePlayer = function(params,callback) {
    return callback(200, "OK");
};

function userCreateTeam(auth,params, callback) {
    console.log("---------Start of userCreateTeam------------");
    var hasTeamsql = "SELECT userTeamID FROM User WHERE userTeamID IS NOT NULL AND username="+aux.connection.escape(auth["username"]);
    return aux.connection.query(hasTeamsql, function(err, rows) {
        if(err)
        {
            return aux.onError(err, callback);
        }
        else if(rows.length != 0)
        {
            return callback(403, "TEAM ALREADY EXISTS");
        }
        else
        {
            console.log("12ss25");
            var userTEAMSQL = "INSERT INTO UserTeam SET ?";
            var data = {
                name: params["name"]
            }
            var userUserTeamIDSQL = "SELECT userTeamID FROM UserTeam WHERE name="+aux.connection.escape(params["name"]);
            console.log(userUserTeamIDSQL);
            return aux.connection.query(userTEAMSQL, data, function(err) {
                console.log("1225");
                if(err)
                {  console.log("13335");
                    if(err["code"] == 'ER_DUP_ENTRY') {
                        return callback(403, "TEAMNAME ALREADY EXISTS");
                    }
                    else {
                        return aux.onError(err, callback);
                    }
                }
                else
                {
                    console.log("15");
                    return aux.connection.query(userUserTeamIDSQL, function(err, rows)
                    {
                        console.log("16");
                        if(err)
                        {
                            console.log("17");
                            return aux.onError(err, callback);
                        }
                        if(rows === undefined || rows.length != 1)
                        {
                            console.log("18");
                            return callback(500, "UNEXPECTED INTERNAL ERROR");
                        }
                        else
                        {
                            //dette må fikses  må gjøre connectionsene nested, eller finne en annen løsning
                            var connectUserAndTeamSQL  = "UPDATE User SET userTeamID="+aux.connection.escape(rows[0]["userTeamID"])
                                +" WHERE username="+aux.connection.escape(auth["username"]) +
                                " AND password="+aux.connection.escape(auth["password"]);
                            aux.connection.query(connectUserAndTeamSQL, function(err) {
                                if(err)
                                {
                                    aux.onError(err, callback);
                                }
                            });
                            console.log("20");
                            var gameWeekTeamSQL = "INSERT INTO GameweekTeam SET ?";
                            var gameweekData = {
                                "gameWeekNumber": "1",
                                "userTeamId": rows[0]["userTeamID"]
                            }
                            aux.connection.query(gameWeekTeamSQL,gameweekData, function(err) {
                                if(err)
                                {
                                    aux.onError(err, callback);
                                }

                            });
                            console.log("22");
                            return callback(202, "ACCEPTED");
                        }

                    });


                }
            });
        }
    });
}

var createTeam = function(params,callback) {
    var auth = aux.authenticate(params);
    aux.loginWithUserPw(auth["username"],auth["password"],
        function() {
            return userCreateTeam(auth,params,callback);
        },
        function() {
            return aux.unauthorized(callback);
        });
};

var deleteTeam = function(params,callback) {
    var allowHeader = {Allow: "GET, PUT, POST"};
    return callback(405, "Method Not Allowed",allowHeader);
};

exports.dispatch = {
    GET:    getTeam,
    PUT:    substitutePlayer,
    POST:   createTeam,
    DELETE: deleteTeam
};