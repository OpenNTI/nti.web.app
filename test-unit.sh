#!/bin/bash

# make sure correct phantomjs is used
PHANTOMJS_VER=`phantomjs --version 2> /dev/null`
if [[ "$PHANTOMJS_VER" != 1.* ]] ; then
	echo 'wrong version of phantomjs, check path'
	exit 1
fi

cd src/test
# run the Jasmine tests and parse the output line-by-line
phantomjs javascript/run-jasmine.js | while read LINE
do
	echo "$LINE"
	# search for failed tests so we can print the filename
	# this sed expression searches for "FAILED: [suite name] > [test name] ..."
	# and prints the suite name if it finds it
	SUITE_NAME=`echo "$LINE" | sed -n 's|FAILED: \(.*\) >.*|\1|p'`
	if [ -n "$SUITE_NAME" ]
		then
			# if we find a suite name, find the file to which this suite belongs
			# and print it
			FILENAME=`egrep -lr --include=*.spec.js "$SUITE_NAME" ../../`
			if [ -n "$FILENAME" ]
				# FILENAME is going to start with "../../" so let's clip that off
				FILENAME=`echo "$FILENAME" | sed 's|../../||'`
				then
				echo "in      $FILENAME"
			fi
	fi
done
