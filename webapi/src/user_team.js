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
    var allowHeader = {"Allow": "GET, PUT, POST"};
    return callback(405, "Method Not Allowed",allowHeader);
};

var pickPlayerFromPool = function(params,callback) {
    var auth = aux.authenticate(params);
    /*
   TODO:Må sjekke at spilleren ikke velger flere en tilatt antall forsvarspillere/osv, samt, hvordan skal jeg håndtere substitutes?
     */
    aux.loginWithUserPw(auth["username"],auth["password"],
        function() {
            getuserTeamIDAndLeagueID(auth["username"], callback, function(userTeamID,leagueID) {
                checkIfPlayerAlreadyExists(leagueID,params["playerid"],"1",callback, function() {
                    isValid(userTeamID,"1",params["playerid"],callback,function(){
                        insertPlayer(userTeamID,params["playerid"],"1",callback);
                    });
     //
                });
            });
        },
        function() {
            aux.unauthorized(callback);
        });
};

function getuserTeamIDAndLeagueID(username,callback, acceptCallback) {
    var sql = "SELECT UserTeam.userTeamID, UserTeam.leagueID " +
        "FROM UserTeam,User " +
        "WHERE User.userTeamID=UserTeam.userTeamID " +
        "AND User.username="+aux.connection.escape(username)+" " +
    "AND leagueID IS NOT NULL";

    aux.connection.query(sql, function(err, rows) {
        if(err ||rows === undefined|| rows.length != 1)
        {
            aux.onError(err, callback);
        }
        else
        {
            acceptCallback(rows[0]["userTeamID"],rows[0]["leagueID"]);
        }
    });
};

function checkIfPlayerAlreadyExists(leagueID,playerID,gameweekNumber,callback,acceptCallback) {
    var sql = "SELECT * FROM playerInformation " +
              "WHERE gameWeekNumber="+aux.connection.escape(gameweekNumber)+
              " AND leagueID="+aux.connection.escape(leagueID)+
              " AND playerID="+aux.connection.escape(playerID);
    aux.connection.query(sql, function(err, rows) {
        if(err ||rows === undefined|| rows.length != 0)
        {
            aux.onError(err, callback);
        }
        else
        {
            acceptCallback();
        }
    });
};

function insertPlayer(userTeamID,playerID,gameweekNumber,callback) {
    var sql = "INSERT INTO GameweekTeam_has_Player SET ?";
    var data =
    {
        "userTeamID": userTeamID,
        "gameWeekNumber": gameweekNumber,
        "playerID": playerID,
        "substitute": "0"
    }
    aux.connection.query(sql, data, function(err) {
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

function isValid(userTeamID, gameweekNumber,playerID, callback, acceptCallback) {
  var sql = "SELECT * FROM teamsView " +
      "WHERE userTeamID="+aux.connection.escape(userTeamID)+
      "AND gameweekNumber="+aux.connection.escape(gameweekNumber);
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else
        {
            var count = countTeamPosition(rows);
            getPlayerPosition(playerID,callback, function(position){
                if(positionIsNotFull(position,count)){
                    acceptCallback();
                }
                else
                {
                    callback(403, "POSITION FULL");
                }
            });
 //
        }
    });
};

function getPlayerPosition(playerID, callback, acceptCallback) {
    var sql = "SELECT position FROM Player WHERE playerID"+aux.connection.escape(playerID);
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else
        {
            acceptCallback(rows[0]["position"]);
        }
    });
};

function positionIsNotFull(position,count) {
    if(position == "keeper") {
       if(count[position] < 2) {return true;}
       else{return false;}
    }
    else if(position == "defender") {
        if(count[position] < 6) {return true;}
        else{return false;}
    }
    else if(position == "midfielder") {
        if(count[position] < 5) {return true;}
        else{return false;}
    }
    else {
        if(count[position] < 3) {return true;}
        else{return false;}
    }
};

function countTeamPosition(rows) {
    var result =
    {
        "keepers" : 0,
        "defenders" : 0,
        "midfielders" : 0,
        "forwards" : 0
    }
    for (var i in rows) {
        if(rows[i]["position"] == "keeper") {
            result["keepers"]++;
        }
        else if(rows[i]["position"] == "defender") {
            result["defenders"]++;
        }
        else if(rows[i]["position"] == "midfielder") {
            result["midfielders"]++;
        }
        else {
            result["forwards"]++;
        }
    }
    return result;
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
            getUserTeamID(name, auth ,callback);
        }
    });
};

function getUserTeamID(name,auth,callback) {
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
           deleteuserTeamSQL(userTeamID,callback);
           aux.onError(err, callback);
        }
        else
        {
            gameweekTEAMSQL(userTeamID, callback);
        }
    });
};

function deleteuserTeamSQL(userTeamID,callback){
   var deleteUserTeamSQL = "DELETE FROM UserTeam WHERE userTeamID="+aux.connection.escape(userTeamID);
    aux.connection.query(deleteUserTeamSQL, function(err) {
        if(err)
        {
            aux.onError(err, callback);
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
           deleteuserTeamSQL(userTeamID,callback);
           deleteGameweekSQL(userTeamID,callback);
           aux.onError(err, callback);
        }
        else
        {
            callback(202, "ACCEPTED");
        }
    });
};

function deleteGameweekSQL(userTeamID, callback) {
    var deleteGmwSQL = " UPDATE User SET userTeamID=NULL WHERE userTeamID="+aux.connection.escape(userTeamID);
    aux.connection.query(deleteUserTeamSQL, function(err) {
        if(err)
        {
            aux.onError(err, callback);
        }
    });
};

exports.dispatch = {
    GET:    getTeam,
    PUT:    pickPlayerFromPool,
    POST:   createTeam,
    DELETE: deleteTeam
};