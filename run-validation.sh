#!/bin/bash

# throw away the dots and x's; we just want the error messages to be logged
LOGFILE=jslint.log
./validatejs.sh >/dev/null 2>$LOGFILE

if [ -s "$LOGFILE" ] # if jslint.log exists and is nonempty
	then # print errors
		echo "JavaScript validation: errors were found:"
		cat $LOGFILE
	else # print that there were no errors
		echo "JavaScript validation: no errors were found."
fi