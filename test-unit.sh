#!/bin/bash

# make sure correct phantomjs is used
PHANTOMJS_VER=`phantomjs --version 2> /dev/null`
if [[ "$PHANTOMJS_VER" != 1.* ]] ; then
	echo 'wrong version of phantomjs, check path'
	exit 1
fi

cd src/test
phantomjs javascript/run-jasmine.js
