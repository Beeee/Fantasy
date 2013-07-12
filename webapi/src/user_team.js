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

var substitutePlayer = function(params,callback) {
    return callback(200, "OK");
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
            "substitute": rows[i]["substitute"][0]
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

function userCreateTeam(auth,params, callback) {
    var hasTeamsql = "SELECT userTeamID FROM User WHERE userTeamID IS NOT NULL AND username="+aux.connection.escape(auth["username"]);
    aux.connection.query(hasTeamsql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else if(rows.length != 0)
        {
            callback(403, "TEAM ALREADY EXISTS");
        }
        else
        {
            insertUserTeam(params["name"],auth,callback );
        }
    });
};

function insertUserTeam(name, auth,callback) {
    var userTEAMSQL = "INSERT INTO UserTeam SET ?";
    var data = {
        name: name
    }
    return aux.connection.query(userTEAMSQL, data, function(err) {
        if(err)
        {
            handleuserTeamSQLError(err,callback);
        }
        else
        {
            setUserTeamID(name, auth ,callback);
        }
    });
};

function setUserTeamID(name,auth,callback) {
    var userUserTeamIDSQL = "SELECT userTeamID FROM UserTeam WHERE name="+aux.connection.escape(name);
    aux.connection.query(userUserTeamIDSQL, function(err, rows)
    {
        if(err)
        {
            aux.onError(err, callback);
        }
        else if(rows === undefined || rows.length != 1)
        {
            callback(500, "UNEXPECTED INTERNAL ERROR");
        }
        else
        {
            updateUserandaddGameweek(rows[0]["userTeamID"], auth, callback);
        }
    });
};

function handleuserTeamSQLError(err,callback){
    if(err["code"] == 'ER_DUP_ENTRY') {
        callback(403, "TEAMNAME ALREADY EXISTS");
    }
    else
    {
        aux.onError(err, callback);
    }
};

function updateUserandaddGameweek(userTeamID, auth, callback) {
    var connectUserAndTeamSQL  = "UPDATE User SET userTeamID="+aux.connection.escape(userTeamID)
        +" WHERE username="+aux.connection.escape(auth["username"]) +
        " AND password="+aux.connection.escape(auth["password"]);
    aux.connection.query(connectUserAndTeamSQL, function(err) {
        if(err)
        {
           aux.onError(err, callback);
        }
        else
        {
            gameweekTEAMSQL(userTeamID, callback);
        }
    });
};

function gameweekTEAMSQL(userTeamID,callback) {
    var gameWeekTeamSQL = "INSERT INTO GameweekTeam SET ?";
    var gameweekData = {
        "gameWeekNumber": "1",
        "userTeamId": userTeamID
    }
    aux.connection.query(gameWeekTeamSQL,gameweekData, function(err) {
        if(err)
        {
           aux.onError(err, callback);
        }
        else
        {
            callback(202, "ACCEPTED");
        }
    });
};

exports.dispatch = {
    GET:    getTeam,
    PUT:    substitutePlayer,
    POST:   createTeam,
    DELETE: deleteTeam
};