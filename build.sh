#!/bin/bash
set -m
set -e
PORT=45674
ZIP="false"

while getopts "z" flag
	do
		case "$flag" in
			'z')
				ZIP="true"
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

EXT='ext-4.0.7'
REVISION=`svn info | grep '^Revision:' | awk '{print $2}'`

# clean out old files
rm -rf build
rm -f app.jsb3
rm -f app-all.js

# build stanging dest
mkdir build
mkdir build/$EXT
mkdir build/$EXT/resources
mkdir build/$EXT/resources/themes

#TODO: change to python-scss command
#Compile SCSS to CSS
gencss.sh

# copy files into build dest
cp -R resources build
cp -R $EXT/resources/css build/$EXT/resources
cp -R $EXT/resources/themes/images build/$EXT/resources/themes

# clean out .svn directories and hidden files
cd build
find . -depth -name ".svn" -exec rm -rf \{\} \;
cd ..

mv build/resources/hangout-app.xml build
cp index.html build
cp config-example.js build/config.js

# change the index.html to point to build resources.
$SED 's/\"src\/main\/app\.js\"/\"app\.js\"/g' build/index.html
$SED 's/<script.\+\?ext-debug.\+\?\/script>//g' build/index.html

#add revision cache busting param (so updates are guaranteed to be requested)
$SED "s/\.css/\.css\?v=$REVISION/g" build/index.html
$SED "s/\.css/\.css\?v=$REVISION/g" build/hangout-app.xml
$SED "s/\.js/\.js\?v=$REVISION/g" build/index.html
$SED "s/\.js/\.js\?v=$REVISION/g" build/hangout-app.xml

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

# concat all code together
cat $EXT/ext.js > build/full.js
cat app-all.js >> build/full.js

#minify code
slimit -m build/full.js > build/app.js

#remove temp
rm build/full.js
rm app-all.js

# package build
if [ "$ZIP" = "true" ]; then
	cd build
	zip -r ../build-r$REVISION.zip . >/dev/null
fi

# Leave the build directory around so
# that we can serve directly from it
