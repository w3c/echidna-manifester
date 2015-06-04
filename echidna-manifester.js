
var Nightmare = require("nightmare")
,   phantomjs = require("phantomjs")
,   u = require("url")
,   seen = {}
;

exports.run = function (path, cb) {
    var nm = new Nightmare({
        phantomPath:    pth.dirname(phantomjs.path) + "/"
    });
    
    nm.on("resourceRequested", function (res) {
        var url = u.parse(res.url);
        if (seen[url.href]) return;
        seen[url.href] = true;
        // XXX here process URL to filter out stuff that you don't want in the manifest
        // e.g. ReSpec, W3C image and CSS
    });
    
    // XXX
    // how do we know that we've finished?
    // call cb()
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
