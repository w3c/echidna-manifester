#!/usr/bin/env node

'use strict';

// Pseudo-constants:
var DEFAULT_OPTIONS = {
    "format":        "manifest"
,   "compactUrls":   true
,   "includeErrors": false
,   "includeTypes":  false
};

// “Global” variables:
var Nightmare = require("nightmare")
,   phantomjs = require("phantomjs-prebuilt")
,   pth       = require("path")
,   u         = require("url")
,   document
,   baseUrl
,   options
,   callback
,   found
,   failed
,   pending
;

var dumpResult = function() {
    var result
    ,   i
    ,   j
    ;
    if ("manifest" === options.format) {
        result = '';
        for (i in found) {
            if (options.compactUrls) result += found[i].compactUrl + '\n';
            else                     result += i + '\n';
        }
        if (options.includeErrors) {
            for (i in failed) {
                if (options.compactUrls) result += failed[i].compactUrl + '\n';
                else                     result += i + '\n';
            }
        }
        if (callback) {
            callback(result);
        } else {
            console.log(result);
        }
    } else if ("json" === options.format) {
        result = {ok: []};
        for (i in found) {
            j = {};
            if (options.compactUrls)  j.url = found[i].compactUrl;
            else                      j.url = i;
            if (options.includeTypes) j.type = found[i].type;
            result.ok.push(j);
        }
        if (options.includeErrors) {
            result.error = [];
            for (i in failed) {
                j = {};
                if (options.compactUrls)  j.url = failed[i].compactUrl;
                else                      j.url = i;
                if (options.includeTypes) j.type = failed[i].type;
                result.error.push(j);
            }
        }
        if (callback) {
            callback(result);
        } else {
            console.log(JSON.stringify(result, null, 2));
        }
    } else if ("plain" === options.format) {
        result = '';
        for (i in found) {
            if (options.compactUrls)  result += found[i].compactUrl + ' ok';
            else                      result += i + ' ok';
            if (options.includeTypes) result += ' ' + found[i].type;
            result += '\n';
        }
        if (options.includeErrors) {
            for (i in failed) {
                if (options.compactUrls)  result += failed[i].compactUrl + ' error';
                else                      result += i + ' error';
                if (options.includeTypes) result += ' ' + failed[i].type;
                result += '\n';
            }
        }
        if (callback) {
            callback(result);
        } else {
            console.log(result);
        }
    }
};

 var getMetadata = function(res) {
    var compactUrl = u.parse(res.url).href.replace(baseUrl, '')
    ,   type = '[unknown]'
    ;
    if (res.status && 200 === res.status) {
        if      (/text\/html?/i                        .test(res.contentType)) type = 'html';
        else if (/text\/css/i                          .test(res.contentType)) type = 'css';
        else if (/image\/\w+/i                         .test(res.contentType)) type = 'img';
        else if (/(application|text)\/(javascript|js)/i.test(res.contentType)) type = 'js';
        else                                                                   type = 'js';
    }
    return {compactUrl: compactUrl, type: type};
};

var processRequest = function(res) {
    pending ++;
};

var processResult = function(res) {
    if (res && res.status && res.stage && 'end' === res.stage) {
        if (200 === res.status) {
            found[res.url] = getMetadata(res);
            pending --;
        } else if (404 === res.status) {
            failed[res.url] = getMetadata(res);
            pending --;
        }
        if (0 === pending) dumpResult();
    }
};

exports.run = function (url, opts, cb) {
    document = url;
    baseUrl = document.replace(/[^\/]*$/, "");
    options = JSON.parse(JSON.stringify(DEFAULT_OPTIONS));
    if (opts) {
        if (opts.hasOwnProperty("format"))        options.format        = opts.format;
        if (opts.hasOwnProperty("compactUrls"))   options.compactUrls   = opts.compactUrls;
        if (opts.hasOwnProperty("includeErrors")) options.includeErrors = opts.includeErrors;
        if (opts.hasOwnProperty("includeTypes"))  options.includeTypes  = opts.includeTypes;
    }
    callback = cb;
    found = {};
    failed = {};
    pending = 0;
    var nm = new Nightmare({
        phantomPath: pth.dirname(phantomjs.path) + "/"
    });
    nm.on("resourceRequested", processRequest);
    nm.on("resourceReceived",  processResult);
    nm.on("resourceError",     processResult);
    nm.goto(document);
    nm.run();
};

// running directly
if (!module.parent) {
    var source = process.argv[2]
    , opts
    ;
    if (process.argv.length > 3) {
        opts = JSON.parse(process.argv[3]);
    }
    if (!source) console.error("Usage: echidna-manifester <PATH-or-URL> [OPTIONS-as-json]");
    // if path is a file, make a URL from it
    if (!/^\w+:/.test(source)) source = "file://" + pth.join(process.cwd(), source);
    exports.run(source, opts);
}

