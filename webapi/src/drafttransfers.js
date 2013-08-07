var draftTransfers = require("./draft/draftingTransfers")

var placeholder = function(params,callback) {
    var allowHeader = {"Allow": "PUT"};
    return callback(405, "Method Not Allowed",allowHeader);
};

var makeTransfer = function(params,callback) {
     return draftTransfers.main(params,callback);
};




exports.dispatch = {
    GET:    placeholder,
    PUT:    makeTransfer,
    POST:   placeholder,
    DELETE: placeholder
};