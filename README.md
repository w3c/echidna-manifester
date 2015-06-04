# echidna-manifester

Some people (whose names shall remain a secret) complained that it could be too hard to generate
Echidna manifests.

What this tool does is that it will load a file you give to it (local or URL) and will try to list
all the resources that it is loaded that are situated under the same directory as that file.

In theory, if you've done things well (and your document can be published under TR without 
modification), then this should list all the dependencies you have that should go into your Echidna
manifest. You can paste them there.

## WARNINGS

There are good reasons that this is not supported directly by Echidna. In the general case, if you
had a reliable process to detect all the resources that a Web page might load then you would have a
solution to the Halting Problem.

So keep in mind that this isn't perfect. For instance, if your document loads stuff that causes 
other stuff to be loaded by script over time, it's possible that the process will time out before 
some resources are loaded, and so they won't get loaded. For specs that should not happen, but for
instance if ReSpec+PhantomJS are being slow together you could be out of luck.

This also does not generate the first entry (the main document) because it can't guess all the
parameters for that. Presumably that's not too bad a problem.

## INSTALLATION

    npm install -g echidna-manifester

## USAGE

Simply:

    echidna-manifester path/to/file

or 

    echidna-manifester http://berjon.com/

It can also be used as a library; if you need that you can figure it out.
