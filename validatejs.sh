#!/bin/bash
PRINT_DOTS="true"

#do fancy stuff when no args present
if [ -z "$1" ]; then
	#if we're not being pipped send to log
	if [ -t 1 -a -t 2 ] ; then
		#this is only going to happen if stdout and stderr point to the terminal
		rm -f jslint.log
		exec 2> jslint.log
	else
		#one of them streams is not pointing to the terminal...
		#if the invoker wants stderr to go to a particular pace, let them...
		#otherwise we want our "error" output to go to stdout
		if [ -t 2 ] ; then
			PRINT_DOTS="false"
			exec 2>&1
		fi
	fi
fi

<<POSIBLE_FLAGS
http://www.jslint.com/lint.html

adsafe=false	bitwise=false	browser=false	cap=false		confusion=false
continue=true	css=false		debug=false		devel=true		eqeq=false
es5=true		evil=false		forin=false		fragment=true	indent=4
maxerr=50		maxlen=90		newcap=false	node=false		nomen=false
on=false		passfail=false	plusplus=false	predef=''		regexp=false
rhino=false		safe=false		sloppy=true		sub=false		undef=false
unparam=true	vars=false		white=false		widget=false	window=false

POSIBLE_FLAGS

LINT_OPTS='continue devel fragment sloppy unparam'
FILES=`find src/main -name \*.js`
ERRORS=false

if [ "$1" != "" ] ; then
	if [ -f $1 ] ; then
		FILES=$1
		PRINT_DOTS="false"
	else
		echo " $1 does not exist"
		exit 1
	fi
fi

for f in $FILES
do
	OUTPUT=`jslint "$f" $LINT_OPTS`
	if [[ "$OUTPUT" != "No error found" ]] ; then
		ERRORS=true
		if [ "$PRINT_DOTS" = "true" ]; then
			echo "" >&2
			echo "Processing: $f:" >&2
		fi
		echo "$OUTPUT" >&2
		echo "" >&2
		echo "" >&2
		if [ "$PRINT_DOTS" = "true" ]; then
			echo -n "x"
		fi
	else
		if [ "$PRINT_DOTS" = "true" ]; then
			echo -n "."
		fi
	fi
done

if [ "$ERRORS" = "true" -a "$PRINT_DOTS" = "true" ]; then
	echo ""
	echo "There are problems"
	exit 1
fi
