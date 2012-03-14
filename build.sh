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
if [[ "`./validatejs.sh`" != "" ]]; then
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
mkdir $DEST/assets
mkdir $DEST/assets/lib
mkdir $DEST/assets/lib/$EXT
mkdir $DEST/assets/lib/$EXT/resources
mkdir $DEST/assets/lib/$EXT/resources/css
mkdir $DEST/assets/lib/$EXT/resources/themes
mkdir $DEST/assets/lib/$EXT/resources/themes/images
mkdir $DEST/assets/lib/mathquill
mkdir $DEST/assets/js

#Compile SCSS to CSS
./gencss.sh > /dev/null

# copy files into build dest
cp -R src/main/resources/css $DEST/assets
cp -R src/main/resources/images $DEST/assets
cp -R src/main/resources/misc $DEST/assets
cp -R lib/$EXT/resources/css/ext-all-gray.css $DEST/assets/lib/$EXT/resources/css
cp -R lib/$EXT/resources/themes/images/gray $DEST/assets/lib/$EXT/resources/themes/images
cp -R lib/mathquill $DEST/assets/lib/mathquill

if [ "$DEBUG" = "true" ]; then
	cp -R src/main/javascript $DEST/assets/js
fi

# clean out .svn directories and hidden files
cd $DEST
find . -depth -name ".svn" -exec rm -rf \{\} \;
find . -depth -name ".sass-cache" -exec rm -rf \{\} \;
cd ..

mv $DEST/assets/misc/hangout-app.xml $DEST
cp src/main/WebApp/index.html $DEST
cp src/main/WebApp/config-example.js $DEST/config.js

if [ "$DEBUG" != "true" ]; then
	# change the index.html to point to build resources.
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
	sencha create jsb -a http://localhost:$PORT/src/main/WebApp/index.html -p app.jsb3

	# kill the http server
	echo "Stopping Simple HTTP Server"
	HPID=`jobs -l 1 | awk '{print $2}'`
	kill -9 $HPID &> /dev/null

	# modify project file with values instead of 'placeholders'
	$SED 's/\"Project Name\"/\"Application\"/g' app.jsb3
	$SED 's/Company Name\"/NextThought LLC\"/g' app.jsb3
	$SED 's/assets\/lib/lib/g' app.jsb3
	$SED 's/assets\/js/src\/main\/javascript/g' app.jsb3
	$SED 's/\"app.js\"/\"src\/main\/javascript\/app\.js\"/g' app.jsb3
	#don't let sencha command do the compression...
	$SED 's/\"compress\"\: true,/\"compress\"\: false,/g' app.jsb3

	# perform build
	sencha build -p app.jsb3 -d .

	# clean out artifact files not needed anymore
	rm -f app.jsb3
	rm -f all-classes.js

	# concat all code together (ext and app code)
	cat lib/$EXT/ext.js > $DEST/assets/js/app.js
	echo "/*break*/" >> $DEST/assets/js/app.js
	cat app-all.js >> $DEST/assets/js/app.js
	echo "" >> $DEST/assets/js/app.js

	#remove temp
	rm app-all.js

	#minify
	#zeta -c $DEST/assets/js/app.js
	#slimit -m $DEST/assets/js/app.js > $DEST/assets/js/app.min.js
	#rm $DEST/assets/js/app.js
	#mv $DEST/assets/js/app.min.js $DEST/assets/js/app.js
fi

./genmanifest.sh -d


# package build
if [ "$ZIP" = "true" ]; then
	cd $DEST
	zip -r ../$DEST-r$REVISION.zip . >/dev/null
	cd ..
	rm -rf $DEST
fi
