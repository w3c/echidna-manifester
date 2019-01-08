
# echidna-manifester

:warning: This project is discontinued, and not being actively maintained.

Some people (whose names shall remain a secret) complained that it could be too hard to generate
[Echidna](https://github.com/w3c/echidna) [manifests](https://github.com/w3c/echidna/wiki/How-to-use-Echidna#request-a-publication).

What this tool does is load a file you give to it (local or URL) and try to list
all the resources that it loads, and that are situated under the same directory as that file.

In theory, if you've done things well (and your document can be published under TR without
modification), then this should list all the dependencies you have that should go into your Echidna
manifest. You can paste them there.

## Warnings

There are good reasons that this is not supported directly by Echidna. In the general case, if you
had a reliable process to detect all the resources that a Web page might load then you would have a
solution to the Halting Problem.

So keep in mind that this isn't perfect. For instance, if your document loads stuff that causes
other stuff to be loaded by script over time, it's possible that the process will time out before
some resources are loaded, and so they won't get loaded. For specs that should not happen, but for
instance if ReSpec+PhantomJS are being slow together you could be out of luck.

This also does not generate the first entry (the main document) because it can't guess all the
parameters for that. Presumably that's not too bad a problem.

## Installation

To use it **from the command line**, type:
```bash
$ npm install -g echidna-manifester
```

To use **as a Node.js module**, add it to your `package.json` file:
```javascript
"dependencies": {
    ⋮
    "echidna-manifest": "^0.1.0"
}
```
And *require* it as usual:
```javascript
var em = require('echidna-manifester');
```

## Usage

**From the command line**, invoke it with these arguments:
```bash
$ echidna-manifester <PATH/TO/FILE> [OPTIONS-AS-JSON]
```

Some examples:
```bash
$ echidna-manifester http://berjon.com/
$ echidna-manifester /tmp/spec.html '{"format": "plain"}'
$ echidna-manifester https://foo.com/bar.html '{"includeErrors": true, "includeTypes": true}'
```

**As a Node.js module**: `echidna-manifester` exports only one function, `run`.
These are its arguments:

1. `url` (`String`): required
2. `options` (`Object`): optional.  
  If absent, default options will be applied.
3. `callback` (`Function`): optional.  
  Signature: `function(data)`.  
  If absent, the output will be `console.log`ged.

```javascript
var em = require('echidna-manifester');
var url = 'https://foo.com/bar.html';
var options = {
    "format": "json",
    "compactUrls": false,
};
var callback = function(data) {
    console.dir(data);
};

em.run(url, options, callback);
```

## Output formats and options

The object `options` may include these properties (default values are **in bold**):

* `'format'`:  
  {**`'manifest'`**, `'json'`, `'plain'`}  
  * `'manifest'`: a format that is appropriate for an [Echidna](https://github.com/w3c/echidna) manifest
  * `'json'`: a JSON object
  * `'plain'`: text, one line per resource, fields separated by spaces: `URL STATUS [TYPE]`
* `'compactUrls'`  
  {**`true`**, `false`}  
  Omit the beginning of the URL
* `'includeErrors'`  
  {`true`, **`false`**}  
  Whether resources that could *not* be loaded should be included in the output, too
* `'includeTypes'`  
  {`true`, **`false`**}  
  Add a string to idenfity the type of resource (kind of MIME), if possible;  
  this parameter is ignored when the format is `'manifest'`

### Examples

All these examples use `example/dummy-spec.html`.

Use from the command line, with default options:
```bash
$ node echidna-manifester example/dummy-spec.html
dummy-spec.html
foo.css
baz.js
http://www.w3.org/Consortium/Offices/w3coffice.png
http://www.w3.org/2014/10/stdvidthumb.png
bar.jpeg
```

Invoke from JavaScript, specifying JSON output and failed resources too:
```javascript
var em = require('echidna-manifester');

em.run(
    'example/dummy-spec.html',
    {
        "format":        "json",
        "includeErrors": true
    },
    processJSON
);
```

```json
{
    "ok": [
        {"url": "dummy-spec.html"},
        {"url": "foo.css"},
        {"url": "baz.js"},
        {"url": "http://www.w3.org/Consortium/Offices/w3coffice.png"},
        {"url": "http://www.w3.org/2014/10/stdvidthumb.png"},
        {"url": "bar.jpeg"}
    ],
    "error": [
        {"url": "i-do-not-exist.css"},
        {"url": "i-do-not-exist.svg"}
    ]
}
```

From the command line, in plain text, with full URLs and with types:
```bash
$ node echidna-manifester example/dummy-spec.html '{"format": "plain", "includeTypes": true, "compactUrls": false}'
example/dummy-spec.html ok html
example/foo.css ok css
example/baz.js ok js
http://www.w3.org/Consortium/Offices/w3coffice.png ok img
http://www.w3.org/2014/10/stdvidthumb.png ok img
example/bar.jpeg ok img
```

