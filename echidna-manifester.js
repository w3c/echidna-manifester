#!/usr/bin/env node

var Nightmare = require("nightmare")
,   phantomjs = require("phantomjs")
,   pth = require("path")
,   u = require("url")
,   seen = {}
;

exports.run = function (loadURL) {
    var nm = new Nightmare({
        phantomPath:    pth.dirname(phantomjs.path) + "/"
    });
    
    nm.on("resourceRequested", function (res) {
        var url = u.parse(res.url)
        ,   baseDir = loadURL.replace(/[^\/]*$/, "")
        ;
        if (seen[url.href]) return;
        seen[url.href] = true;
        if (url.href.indexOf(baseDir) === 0) {
            var loaded = url.href.replace(baseDir, "");
            if (loaded) console.log(loaded);
        }
    });
    nm.goto(loadURL);
    nm.run();
};

// running directly
if (!module.parent) {
    var source = process.argv[2];
    if (!source) console.error("Usage: echidna-manifester [PATH or URL]");
    // if path is a file, make a URL from it
    if (!/^\w+:/.test(source)) source = "file://" + pth.join(process.cwd(), source);
    exports.run(source);
}
