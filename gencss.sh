#!/bin/bash

SCSS=`which scss`
SASS=${SCSS:-`which sass`}

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

if [[ "`$SASS --help`" == *-m* ]] ; then
	SASS="$SASS -m"
fi

#echo "Using: $SASS"

$SASS resources/scss/main.scss resources/css/main.css
