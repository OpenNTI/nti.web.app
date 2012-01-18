#!/bin/bash
set -m
set -e
PORT=45674
ZIP="false"
DEBUG="false"
DEST="build"


while getopts "dz" flag
	do
		case "$flag" in
			'd')	DEBUG="true"
					DEST="$DEST-debug"
					echo "Debug output"
					;;
			'z')	ZIP="true"
					;;
			[?])	echo "Usage: $0 [-d] [-z]" >&2
					echo ""
					echo "	-d	debug output"
					echo "	-z	zip output"
					echo ""
					exit 1
					;;
		esac
	done

# Add some other locations to search
for p in {~/bin,/opt/nti}/senchatools/ {~/bin,/opt/nti}/senchatools/{command,appbuilder,jsbuilder}; do
	PATH=$PATH:$p
done

# Account for system diffs in sed commands
case `uname` in
	'Darwin')
		# Must use macports GNU sed, the BSD
		# version handles inplace editing badly
		SED='gsed --in-place -e'
		;;
	'Linux')
		SED='sed --in-place -e'
		;;
esac


SENCHA_TOOLS=${SENCHA_TOOLS:-`which sencha | sed -e 's/command\/sencha//g'`}
PHANTOMJS=${PHANTOMJS:-`which phantomjs`}

if [ -z "$SENCHA_TOOLS" ]; then
	echo "Sencha Tools are required"
	exit 1
fi

if [ -z "$PHANTOMJS" ]; then
	echo "PhantomJS not found..."
fi

if [[ "$PHANTOMJS" != $SENCHA_TOOLS* ]] ; then
	PATH=$SENCHA_TOOLS:$PATH
fi


echo -n "Validating javascript..."
# error code not being friendly, just capture the output and string compare :/
if [[ "`validatejs.sh`" != "" ]]; then
	echo "errors, javascript compression will not work until these are fixed"
	exit 1
else
	echo "passed"
fi

EXT='ext-4.0.7'
REVISION=`svn info | grep '^Revision:' | awk '{print $2}'`

# clean out old files
rm -rf build
rm -rf build-debug
rm -f app.jsb3
rm -f app-all.js
rm -f all-classes.js

# build stanging dest
mkdir $DEST
mkdir $DEST/$EXT
mkdir $DEST/$EXT/resources
mkdir $DEST/$EXT/resources/themes

#TODO: change to python-scss command
#Compile SCSS to CSS
gencss.sh

# copy files into build dest
cp -R resources $DEST
cp -R $EXT/resources/css $DEST/$EXT/resources
cp -R $EXT/resources/themes/images $DEST/$EXT/resources/themes
if [ "$DEBUG" = "true" ]; then
	mkdir $DEST/src
	cp -R src/main $DEST/src
fi

# clean out .svn directories and hidden files
cd $DEST
find . -depth -name ".svn" -exec rm -rf \{\} \;
cd ..

mv $DEST/resources/hangout-app.xml $DEST
cp index.html $DEST
cp config-example.js $DEST/config.js

if [ "$DEBUG" != "true" ]; then
	# change the index.html to point to build resources.
	$SED 's/\"src\/main\/app\.js\"/\"app\.js\"/g' $DEST/index.html
	$SED 's/<script.\+\?ext-debug.\+\?\/script>//g' $DEST/index.html
fi

#add revision cache busting param (so updates are guaranteed to be requested)
$SED "s/\.css/\.css\?v=$REVISION/g" $DEST/index.html
$SED "s/\.css/\.css\?v=$REVISION/g" $DEST/hangout-app.xml
$SED "s/\.js/\.js\?v=$REVISION/g" $DEST/index.html
$SED "s/\.js/\.js\?v=$REVISION/g" $DEST/hangout-app.xml

if [ "$DEBUG" != "true" ]; then
	# fire up an http server in the background
	echo "Starting SimpleHTTP Server"
	python -m SimpleHTTPServer $PORT >/dev/null 2>&1 &

	# generate project file
	sencha create jsb -a http://localhost:$PORT/index.html -p app.jsb3

	# kill the http server
	echo "Stopping Simple HTTP Server"
	HPID=`jobs -l 1 | awk '{print $2}'`
	kill -9 $HPID

	# modify project file with values instead of 'placeholders'
	$SED 's/\"Project Name\"/\"Application\"/g' app.jsb3
	$SED 's/Company Name\"/NextThought LLC\"/g' app.jsb3
	$SED 's/\"app.js\"/\"src\/main\/app\.js\"/g' app.jsb3
	#don't let sencha command do the compression...
	$SED 's/\"compress\"\: true,/\"compress\"\: false,/g' app.jsb3

	# perform build
	sencha build -p app.jsb3 -d .

	# clean out artifact files not needed anymore
	rm -f app.jsb3
	rm -f all-classes.js

	# concat all code together (ext and app code)
	cat $EXT/ext.js > $DEST/app.js
	echo "/*break*/" >> $DEST/app.js
	cat app-all.js >> $DEST/app.js
	echo "" >> $DEST/app.js

	#remove temp
	rm app-all.js

	#minify
	#zeta -c $DEST/app.js
	#slimit -m $DEST/app.js > $DEST/app.min.js
	#rm $DEST/app.js
	#mv $DEST/app.min.js $DEST/app.js
fi

# package build
if [ "$ZIP" = "true" ]; then
	cd $DEST
	zip -r ../$DEST-r$REVISION.zip . >/dev/null
	cd ..
	rm -rf $DEST
fi
