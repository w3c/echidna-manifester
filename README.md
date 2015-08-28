
# echidna-manifester

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

### To use from the command line

```bash
npm install -g echidna-manifester
```

### To use as a library

```json
{
  "dependencies": {
    "echidna-manifest": "^0.1.0"
  }
}
```

```javascript
var em = require('echidna-manifester');
```

## Usage

### From the command line

```bash
$ echidna-manifester <PATH/TO/FILE> [OPTIONS-AS-JSON]
```

Examples:

```bash
$ echidna-manifester http://berjon.com/
$ echidna-manifester /tmp/spec.html '{"format": "plain"}'
$ echidna-manifester https://foo.com/bar.html '{"includeErrors": true, "includeTypes": true}'
```

### As a library

```javascript
var em = require('echidna-manifester');
var url = 'https://foo.com/bar.html';
var options = {
    "format": "json",
    "compactUrls": false,
};
var callback = function(data) {
    sendByEmail(data);
};

em.run(url, options, callback);
```

## Output formats and options

The object `options` may include these properties (in **bold**, default values):

* `'format'`:  
  {**`'manifest'`**, `'json'`, `'plain'`}  
  ** `'manifest'`: format appropriate for an [Echidna](https://github.com/w3c/echidna) manifest (plain text)
  ** `'json'`: JSON object
  ** `'plain'`: plain text, one line per resource; fields: `URL status type`
* `'compactUrls'`  
  {**`true`**, `false`}  
  Omit the beginning of the URL that is common to all resources
* `'includeErrors'`  
  {`true`, **`false`**}  
  Whether resources that could *not* be loaded should be included in the output, too
* `'includeTypes'`  
  {`true`, **`false`**}  
  Add MIME metadata to idenfity the type of resource, if known (this parameter is ignored when the format is `'manifest'`)

### Examples

```bash
$ node echidna-manifester \
  http://www.w3.org/People/Antonio/spec/dummy-spec.html
dummy-spec.html
foo.css
baz.js
http://www.w3.org/Consortium/Offices/w3coffice.png
http://www.w3.org/2014/10/stdvidthumb.png
bar.jpeg
```

```javascript
require('echidna-manifester').run(
    'http://www.w3.org/People/Antonio/spec/dummy-spec.html',
	{
	    "format":        "json",
		"includeErrors": true
	},
	doStuffWithData
);
```

```json
{
  "ok": [
    {
      "url": "dummy-spec.html"
    },
    {
      "url": "foo.css"
    },
    {
      "url": "baz.js"
    },
    {
      "url": "http://www.w3.org/Consortium/Offices/w3coffice.png"
    },
    {
      "url": "http://www.w3.org/2014/10/stdvidthumb.png"
    },
    {
      "url": "bar.jpeg"
    }
  ],
  "error": [
    {
      "url": "i-do-not-exist.css"
    },
    {
      "url": "i-do-not-exist.svg"
    }
  ]
}
```

```bash
$ node echidna-manifester \
  http://www.w3.org/People/Antonio/spec/dummy-spec.html \
  '{"format": "plain", "includeTypes": true, "compactUrls": false}'
http://www.w3.org/People/Antonio/spec/dummy-spec.html ok html
http://www.w3.org/People/Antonio/spec/foo.css ok css
http://www.w3.org/People/Antonio/spec/baz.js ok js
http://www.w3.org/Consortium/Offices/w3coffice.png ok img
http://www.w3.org/2014/10/stdvidthumb.png ok img
http://www.w3.org/People/Antonio/spec/bar.jpeg ok img
```

