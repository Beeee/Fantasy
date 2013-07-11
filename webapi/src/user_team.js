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

function alreadyHasTeam(username)
{
    var sql = "Select userTeamID FROM User WHERE username="+aux.connection.escape(username);
    return aux.connection.query(sql, function(err, rows) {
        if(err || rows.length != 0)
        {
            return true;
        }
        else
        {
            return false;
        }
    });
};

var createTeam = function(params,callback) {
    var auth = aux.authenticate(params);
    if(aux.loginWithUserPw(auth["username"],auth["password"])) {
       if(!alreadyHasTeam)
       {
           var userTEAMSQL = "INSERT INTO UserTeam SET ?";
           var data = {
               name: params["name"]
           }
           var userUserTeamIDSQL = "SELECT userTeamID FROM UserTeam WHERE name="+aux.connection.escape(params["name"]);
           return aux.connection.query(userTEAMSQL, data, function(err) {
               if(err)
               {
                   if(err["code"] === 'ER_DUP_ENTRY') {
                       return callback(403, "TEAMNAME ALREADY EXISTS");
                   }
                   else {
                       return aux.onError(err, callback);
                   }
               }
               else
               {
                   return aux.connection.query(userUserTeamIDSQL, function(err, rows)
                   {
                       if(err)
                       {
                           return aux.onError(err, callback);
                       }
                       if(rows === undefined || rows.length != 1)
                       {
                           return callback(500, "UNEXPECTED INTERNAL ERROR");
                       }
                       else
                       {
                           var connectUserAndTeamSQL  = "UPDATE User SET userTeamID="+aux.connection.escape(rows[0]["userTeamID"])
                               +" WHERE username="+aux.connection.escape(auth["username"]) +
                               " AND password="+aux.connection.escape(auth["password"]);
                           return aux.connection.query(connectUserAndTeamSQL, function(err) {
                               if(err)
                               {
                                   return aux.onError(err, callback);
                               }
                               else{
                                   return callback(202, "ACCEPTED");
                               }
                           });
                       }

                   });
               }
           });
       }
       else
       {
           return callback(403, "TEAM ALREADY EXISTS");
       }
     }
    else
    {
        return callback(401, "Unauthorized");
    }
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