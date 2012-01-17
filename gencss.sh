#!/bin/bash
PATH=$PATH:/opt/local/Library/Frameworks/Python.framework/Versions/2.7/bin

#if you have the ruby gem installed... just use it for now
#if [ -n `which sass` ]; then
#	sass --scss --force resources/scss/main.scss resources/css/main.css
#	exit 0
#fi


FILE=resources/scss/main.scss
if [ -n `which zeta` ]; then
	set -e
	# Errors in the source prevent compression from working, so -c
	if [ -e resources/scss/_main.scss ]; then
		rm resources/scss/_main.scss
	fi
	cd resources/scss
	zeta pack main.scss &>/dev/null
	cd ../..
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

if [[ "`scss --help`" == *-m* ]] ; then
	SASS="scss -m -W -C -S"
fi

#echo "Using: $SASS"

$SASS $FILE resources/css/main.css

if [ -e resources/scss/_main.scss ]; then
	rm resources/scss/_main.scss
fi
