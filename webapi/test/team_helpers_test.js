var helpers = require("./../src/team_helpers");

exports.getPlayerPosition = {
    'keeper': function (test) {
        test.expect(1);
        helpers.getPlayerPosition(3,function(code,text) {
            test.equal(code,500, "Callback should not be called");
            test.done();

        }, function(position) {
            test.equal(position,"keeper", "Position Fail");
            test.done();
        });
    },
    'defender': function (test) {
        test.expect(1);
        helpers.getPlayerPosition(4,function(code,text) {
            test.ok(false, "This method should not be called");
            test.done();

        }, function(position) {
            test.equal(position,"defender", "Position Fail");
            test.done();
        });
    },
    'midfielder': function (test) {
        test.expect(1);
        helpers.getPlayerPosition(8,function(code,text) {
            test.ok(false, "This method should not be called");
            test.done();

        }, function(position) {
            test.equal(position,"midfielder", "Position Fail");
            test.done();
        });
    },
    'forward': function (test) {
        test.expect(1);
        helpers.getPlayerPosition(13,function(code,text) {
            test.ok(false, "This method should not be called");
            test.done();

        }, function(position) {
            test.equal(position,"forward", "Position Fail");
            test.done();
        });
    },
    'invalid input': function (test) {
       test.expect(1);
        helpers.getPlayerPosition(1,function(code,text) {
            test.equal(code,500, "Wrong code: " + code);
            test.done();

        }, function(position) {
            test.ok(false, "This method should not be called: "+ position);
            test.done();
        });
    }

};

exports.testCountplayingTeam = {
    'ingulf count': function(test) {
     test.expect(1);
        var expect =
        {
            "keepers" : 1,
            "defenders" : 4,
            "midfielders" : 5,
            "forwards" : 1
        }
        helpers.getTeam(65,1,function(code,text) {
            test.ok(false, "This method should not be called");
            test.done();
        }, function(team) {
            var count = helpers.countPlayingTeam(team);
            test.deepEqual(count,expect,"Not equal");
            test.done();
        });

    },
    'is Valid Playing Team': function(test) {
        test.expect(10);
        var expect =
        {
            "keepers" : 1,
            "defenders" : 4,
            "midfielders" : 5,
            "forwards" : 1
        }
        var f1451 = helpers.isValidPlayingTeam(expect);
        expect["keepers"] = 2;
        var f2451 = helpers.isValidPlayingTeam(expect);

        expect["keepers"] = 1;
        expect["defenders"] = 5;
        expect["midfielders"]= 4;
        expect["forwards"]= 1;
        var f1541 = helpers.isValidPlayingTeam(expect);

        expect["defenders"] = 5;
        expect["midfielders"]= 3;
        expect["forwards"]= 2;
        var f1532 = helpers.isValidPlayingTeam(expect);

        expect["defenders"] = 6;
        expect["midfielders"]= 3;
        expect["forwards"]= 1;
        var f1631 = helpers.isValidPlayingTeam(expect);

        expect["defenders"] = 4;
        expect["midfielders"]= 3;
        expect["forwards"]= 3;
        var f1433 = helpers.isValidPlayingTeam(expect);

        expect["defenders"] = 4;
        expect["midfielders"]= 4;
        expect["forwards"]= 2;
        var f1442 = helpers.isValidPlayingTeam(expect);

        expect["defenders"] = 4;
        expect["midfielders"]= 6;
        expect["forwards"]= 0;
        var f1460 = helpers.isValidPlayingTeam(expect);

        expect["defenders"] = 5;
        expect["midfielders"]= 2;
        expect["forwards"]= 3;
        var f1523 = helpers.isValidPlayingTeam(expect);

        expect["defenders"] = 4;
        expect["midfielders"]= 2;
        expect["forwards"]= 4;
        var f1424 = helpers.isValidPlayingTeam(expect);

        test.ok(f1451, "1-4-5-1");
        test.ok(f1541, "1-5-4-1");
        test.ok(f1532,"1-5-3-2");
        test.ok(f1433, "1-4-3-3");
        test.ok(f1442,"1-4-4-2");
        test.ok(!f1460, "1-4-6-0");
        test.ok(!f1523, "1-5-2-3");
        test.ok(!f1424, "1-4-2-4");
        test.ok(!f1631, "1-6-3-1");
        test.ok(!f2451, "2-4-5-1");
        test.done();
    }
};

exports.testGetuserTeamIDAndLeagueID = {
    'valid input': function(test) {
      helpers.getuserTeamIDAndLeagueID("ingulf", function(code,text) {
          test.ok(false, "This method should not be called");
          test.done();
      }, function(userTeamID,leagueID) {
          test.equal(userTeamID,65, "Wrong UserTeamID");
          test.equal(leagueID, 8, "Wrong leaugeID");
          test.done();
      })
    },
    'invalid input': function(test) {
    helpers.getuserTeamIDAndLeagueID("WrongUserName", function(code,text) {
        test.equal(code,500, "invalid error code");
        test.done();
    }, function(userTeamID,leagueID) {
        test.ok(false, "This method should not be called, userTeamID: "+ position+ " and leagueID:"+leaugeID);
        test.done();
    })
}
};

exports.TestgetUserTeamIDFromUsername = {
    'valid input': function(test) {
        helpers.getUserTeamIDFromUsername("ingulf", function(code,text) {
            test.ok(false, "This method should not be called");
            test.done();
        }, function(userTeamID) {
            test.equal(userTeamID,65, "Wrong UserTeamID");
            test.done();
        });
    },
    'invalid input': function(test) {
        helpers.getUserTeamIDFromUsername("WrongUserName", function(code,text) {
            test.equal(code,500, "invalid error code");
            test.done();
        }, function(userTeamID) {
            test.ok(false, "This method should not be called, userTeamID: "+ userTeamID+ " and leagueID:");
            test.done();
        });
    }
};

exports.TestgetLeagueIDFromUsername = {
    'valid input': function(test) {
        helpers.getLeagueIDFromUsername("ingulf", function(code,text) {
            test.ok(false, "This method should not be called");
            test.done();
        }, function(leagueID) {
            test.equal(leagueID,8, "Wrong UserTeamID");
            test.done();
        });
    },
    'invalid input': function(test) {
        helpers.getLeagueIDFromUsername("WrongUserName", function(code,text) {
            test.equal(code, 500, "invalid error code");
            test.done();
        }, function(leagueID) {
            test.ok(false, "This method should not be called, leagueID: "+ leagueID);
            test.done();
        });
    }
};

exports.TestgetUserTeamIDFromName = {
    'valid input': function(test) {
       helpers.getUserTeamIDFromName("Bolle",function(code,text) {
          test.ok(false, "This method should not be called");
          test.done();
       }, function(userTeamId){
          test.equal(userTeamId, 66, "Wrong userTeamID");
          test.done();
       });
    },
    'invalid input': function(test) {
        helpers.getUserTeamIDFromName("WrongName",function(code,text) {
            test.equal(code,500, "wrong code");
            test.done();
        }, function(userTeamId){
            test.ok(false, "This method should not be called, userTeamID: "+ userTeamId);
            test.done();
        });
    }
};

exports.testCheckIfPlayerIsAvailableInTheLeague = {
    'check valid ': function(test) {
    helpers.checkIfPlayerIsAvailableInTheLeague(8,58,1,function(code,text) {
            test.ok(false, "This method should not be called");
            test.done();
        }, function(){
            test.ok(true)
            test.done();
        })
    },
    'invalid input - playerID not available': function(test) {
       helpers.checkIfPlayerIsAvailableInTheLeague(8,34,1,function(code,text){
           test.equal(code,500, "The error code is wrong!");
           test.done();
       }, function(){
           test.ok(false, "This method should not be called");
           test.done();
       });
    }
};

exports.testPositionIsNotFull = {
    'test ': function(test) {
        var count = generateCount(1,2,3,2);
        var keeper1 = helpers.positionIsNotFull("keeper", count);
        var defender1 = helpers.positionIsNotFull("defender", count);
        var midfielder1 = helpers.positionIsNotFull("midfielder", count);
        var forward1 = helpers.positionIsNotFull("forward", count);

        count = generateCount(2,6,5,3);
        var keeper2 = helpers.positionIsNotFull("keeper", count);
        var defender2 = helpers.positionIsNotFull("defender", count);
        var midfielder2 = helpers.positionIsNotFull("midfielder", count);
        var forward2 = helpers.positionIsNotFull("forward", count);

        count = generateCount(3,7,6,4);
        var keeper3 = helpers.positionIsNotFull("keeper", count);
        var defender3 = helpers.positionIsNotFull("defender", count);
        var midfielder3 = helpers.positionIsNotFull("midfielder", count);
        var forward3 = helpers.positionIsNotFull("forward", count);

        count = generateCount(0,0,0,0);
        var keeper4 = helpers.positionIsNotFull("keeper", count);
        var defender4 = helpers.positionIsNotFull("defender", count);
        var midfielder4 = helpers.positionIsNotFull("midfielder", count);
        var forward4 = helpers.positionIsNotFull("forward", count);

        test.ok(keeper1, "k1");
        test.ok(!keeper2, "k2");
        test.ok(!keeper3, "k3");
        test.ok(keeper4, "k4");

        test.ok(defender1, "d1");
        test.ok(!defender2, "d2");
        test.ok(!defender3, "d3");
        test.ok(defender4, "d4");

        test.ok(midfielder1, "m1");
        test.ok(!midfielder2, "m2");
        test.ok(!midfielder3, "m3");
        test.ok(midfielder4, "m4");

        test.ok(forward1, "f1");
        test.ok(!forward2, "f2");
        test.ok(!forward3, "f3");
        test.ok(forward4, "f4");

        test.done()
    }
};

function generateCount(keeper,defender,midfielder,forward) {
    var count =
    {
        "keepers" : keeper,
        "defenders" : defender,
        "midfielders" : midfielder,
        "forwards" : forward
    }
    return count;
};
/*
exports.testcountTeamPosition = {
    'check valid ': function(test) {
        test.ok(false, "NOT IMPLEMENTED")
        test.done()
    },
    'invalid input': function(test) {
        test.ok(false, "NOT IMPLEMENTED")
        test.done()
    },
    'err': function(test) {
        test.ok(false, "NOT IMPLEMENTED")
        test.done()
    }
};

exports.testgetTeam = {
    'check valid ': function(test) {
        test.ok(false, "NOT IMPLEMENTED")
        test.done();
    },
    'invalid input': function(test) {
        test.ok(false, "NOT IMPLEMENTED")
        test.done()
    },
    'err': function(test) {
        test.ok(false, "NOT IMPLEMENTED")
        test.done()
    }
};
  */