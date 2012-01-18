#!/bin/bash
rm -f jslint.log
exec 2> jslint.log

<<POSIBLE_FLAGS
adsafe=false	bitwise=false	browser=false	cap=false		confusion=false
continue=false	css=false		debug=false		devel=true		eqeq=false
es5=true		evil=false		forin=false		fragment=true	indent=4
maxerr=50		maxlen=90		newcap=false	node=false		nomen=false
on=false		passfail=false	plusplus=false	predef=''		regexp=false
rhino=false		safe=false		sloppy=true		sub=false		undef=false
unparam=true	vars=false		white=false		widget=false	window=false
POSIBLE_FLAGS

LINT_OPTS='devel es5 fragment sloppy unparam'
FILES=`find src/main -name \*.js`
ERRORS=false

for f in $FILES
do
	OUTPUT=`jslint "$f" $LINT_OPTS`
	if [[ "$OUTPUT" != "No error found" ]] ; then
		ERRORS=true
		echo "" >&2
		echo "Processing: $f:" >&2
		echo "$OUTPUT" >&2
		echo "" >&2
		echo "" >&2
		echo -n "x"
	else
		echo -n "."
	fi
done

if [ "$ERRORS" = "true" ]; then
	echo ""
	echo "There were problems"
	exit 1
fi
