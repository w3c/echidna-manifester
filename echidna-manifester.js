
var Nightmare = require("nightmare")
,   phantomjs = require("phantomjs")
;


exports.run = function (path, cb) {
    var nm = new Nightmare({
        phantomPath:    pth.dirname(phantomjs.path) + "/"
    });
};

// running directly
if (!module.parent) {
    var source = process.argv[2];
    if (!source) console.error("Usage: echidna-manifester PATH");
    exports.run(source, function (str) {
        if (str) console.error("[ERROR]", str);
        else console.log("Ok!");
    });
}
