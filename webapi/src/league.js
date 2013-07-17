var aux = require("./auxiliar");

var getLeagueInformation = function(params,callback) {
    return callback(200, "NOT IMPLEMENTED");
};

var addTeam = function(params,callback) {
    var auth = aux.authenticate(params);
    aux.loginWithUserPw(auth["username"],auth["password"], function() {
            console.log("Start of addteam")
            if(params["username"] === undefined)
            {
                callback(400, "Bad Request");
            }
            else
            {
                validateUserAddTeam(params["username"], callback, function(userTeamID) {
                    adminCheck(auth["username"],callback, function(leagueID) {
                        insertTeamInLeagueSQL(leagueID, userTeamID, callback);
                    });
                });
            }
        },
        function() {
            return aux.unauthorized(callback);
        });

};

function validateUserAddTeam(username,callback,acceptedCallback){
    var sql = "SELECT UserTeam.userTeamID " +
        "FROM User, UserTeam " +
        "WHERE User.userTeamID=UserTeam.userTeamID AND leagueID IS NULL AND User.username="+aux.connection.escape(username);
    console.log(sql);
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else if(rows === undefined || rows.length != 1)
        {
            callback(403, "THE TEAM ALREADY HAS A LEAGUE");
        }
        else {
            acceptedCallback(rows[0]["userTeamID"]);
        }
    });
};

function adminCheck(adminUsername,callback, acceptCallback) {
    var sql =  "SELECT leagueID FROM leagueUserTeam WHERE username="+aux.connection.escape(adminUsername);
    console.log(sql);
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else if(rows === undefined || rows.length != 1)
        {
            callback(403, "THE USER IS NOT AN ADMIN");
        }
        else {
            acceptCallback(rows[0]["leagueID"]);
        }
    });
};

function insertTeamInLeagueSQL(leagueID,userTeamID,callback) {
    var sql = "UPDATE UserTeam " +
        "SET leagueID="+aux.connection.escape(leagueID)+" " +
        "WHERE userTeamID="+aux.connection.escape(userTeamID);
    console.log(sql);
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else {
            callback(202, "Accepted");
        }
    });
};

var createLeague = function(params,callback) {
    var auth = aux.authenticate(params);
    aux.loginWithUserPw(auth["username"],auth["password"], function() {
        if(params["name"] === undefined)
        {
             callback(400, "Bad Request");
        }
        else
        {
            //Må sjekke om brukeren har et lag som allerede hører til en liga
            validateUser(auth["username"], params["name"], callback);
        }
    },
        function() {
        return aux.unauthorized(callback);
    });
};

function validateUser(username,name,callback) {
    var sql = "SELECT * " +
        "FROM User, UserTeam " +
        "WHERE User.userTeamID=UserTeam.userTeamID AND leagueID IS NULL AND User.username="+aux.connection.escape(username);
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
        else if(rows === undefined || rows.length != 1)
        {
            callback(403, "THE TEAM ALREADY HAS A LEAGUE");
        }
        else {
            createNewLeagueSQL(username, name, callback);
        }
    });

   //Må sjekke om: Laget hans allerde er med i en liga
};

function createNewLeagueSQL(username, name, callback) {
    var sql = "INSERT INTO UserLeague SET ?";
    var data = {
        "name": name,
        "admin": username
    }
    aux.connection.query(sql, data, function(err) {
        if(err) {
            handleCreateLeagueSQLError(err,callback);
        }
        else {
            getUserLeagueID(username,name,callback);
         }
    });
};

function handleCreateLeagueSQLError(err,callback){
    if(err["code"] == 'ER_DUP_ENTRY') {
        callback(403, "LEAGUE NAME ALREADY EXISTS");
    }
    else
    {
        aux.onError(err, callback);
    }
};

function getUserLeagueID(username,callback) {
    var sql = "SELECT leagueID FROM UserLeague WHERE admin="+aux.connection.escape(username);
    aux.connection.query(sql, function(err, rows) {
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
            getUserTeamID(username,callback, function(userTeamID) {
                bindTeamAndLeagueSQL(rows[0]["leagueID"],userTeamID,callback);
            });
        }
    });
};

function getUserTeamID(username,callback, acceptCallback) {
     var sql = "SELECT userTeamID FROM User WHERE username="+aux.connection.escape(username);
    aux.connection.query(sql, function(err, rows) {
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
            acceptCallback(rows[0]["userTeamID"]);
        }
    });
}

function bindTeamAndLeagueSQL(leagueID,userTeamID,callback) {
    var sql = "UPDATE UserTeam SET leagueID="+aux.connection.escape(leagueID)+" WHERE userTeamID="+aux.connection.escape(userTeamID);
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            deleteLeague(leagueID,callback);
            aux.onError(err, callback);
        }
        else
        {
            callback(202, "Accepted");
        }
    });

};

function deleteLeague(leagueID,callback) {
    var sql = "DELETE FROM UserLeague WHERE leagueID="+leagueID;
    aux.connection.query(sql, function(err, rows) {
        if(err)
        {
            aux.onError(err, callback);
        }
    });
};

var removeTeam = function(params,callback) {
    return callback(200, "NOT IMPLEMENTED");
};

exports.dispatch = {
    GET:    getLeagueInformation,
    PUT:    addTeam,
    POST:   createLeague,
    DELETE:   removeTeam
};