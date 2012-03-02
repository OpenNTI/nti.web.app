#!/bin/bash
REVISION=`svn info | grep '^Revision:' | awk '{print $2}'`
NOW=`date "+DATE: %Y-%m-%d %H:%M:%S"`
if [ "$1" != "" ] ; then
	cd build
else
	cd src/main/WebApp
fi

OUTPUT="CACHE MANIFEST\n#$NOW r$REVISION\n"

FILES=`find -L . -not \( -name ".svn" -a -prune \) -a -type f \( ! -iname ".*" \)`
for f in $FILES
do
	OUTPUT="$OUTPUT\n${f##./}"
done

OUTPUT="$OUTPUT\n\nFALLBACK:\n/ offline.html\n\nNETWORK:\n*"

echo -e $OUTPUT > manifest.appcache

<<TEMPL
CACHE MANIFEST

config.js
index.html
assets/css/style.css
assets/misc/mathjaxconfig.js
assets/images/favicon.ico

FALLBACK:
/ assets/misc/offline.json

NETWORK:
*

TEMPL
