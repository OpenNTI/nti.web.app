#!/bin/bash
PATH=$PATH:/opt/local/Library/Frameworks/Python.framework/Versions/2.7/bin

if [ -n `which zeta` ]; then
	set -e
	# Errors in the source prevent compression from working, so -c is 
	# disabled for now
	zeta pack -p '' resources/scss/main.scss  -o resources/css
	mv resources/css/main.scss resources/css/main.css
	exit 0
fi

SASS=`which sass`

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

$SASS resources/scss/main.scss resources/css/main.css
