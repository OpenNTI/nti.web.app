#!/bin/bash
PATH=$PATH:/opt/local/Library/Frameworks/Python.framework/Versions/2.7/bin

FILE=resources/scss/main.scss
if [ -n `which zeta` ]; then
	set -e
	# Errors in the source prevent compression from working, so -c
	if [ -e resources/scss/_main.scss ]; then
		rm resources/scss/_main.scss
	fi
	zeta pack  -c resources/scss/main.scss  -o resources/scss/
	FILE=resources/scss/_main.scss
fi

SASS=`which scss`

if [ -z "$SASS" ]; then
    echo "Sass not installed"
    echo "run one of these commands:"
    echo ""
    echo "    sudo easy_install scss"
    echo "- or -"
    echo "    sudo gem install sass"
    echo ""
    exit 1
fi
set -e

if [[ "`$SASS --help`" == *-m* ]] ; then
	SASS="$SASS -m"
fi

#echo "Using: $SASS"

$SASS $FILE resources/css/main.css
