var placeholder = function(params,callback) {
    var allowHeader = {"Allow": "GET,PUT,POST,DELETE,"};
    return callback(405, "Functionality not yet implemented",allowHeader);
};

/*
   Funksjoner som trengs:
   Iniate Swap
   acceptSwap
   avslå swap
   trekke tilbake
   Hente ut swaps in league
   Hente ut swaps foresltått av bruker


   ----------------------
   Andre krav:
   - swaps må forsvinne når noen gjør et bytte med pool
   - Begge må godta
   - Mulig å tilby flere
   - posisjon mot posisjon
   - må være innlogga for  accepte

   Database setup:
   - userTeamID for player 1 og player 2
   - leagueID
   - player id 1 og 2
   - user 1 accpted
   - user 2 accepted
   - timestamp

 */

exports.dispatch = {
    GET:    placeholder,
    PUT:    placeholder,
    POST:   placeholder,
    DELETE: placeholder
};

