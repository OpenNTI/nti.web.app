#!/bin/bash
set -m
set -e
PORT=45674
SENCHA_TOOLS=`which sencha | sed -e 's/command\/sencha//g'`
PHANTOMJS=`which phantomjs`
EXT='ext-4.0.7'
REVISION=`svn info | grep '^Revision:' | awk '{print $2}'`

if [ -z "$SENCHA_TOOLS" ]; then
    echo "Sencha Tools are required"
    exit 1
fi

if [ -z "$PHANTOMJS" ]; then
    echo "PhantomJS not found..."
fi

if [[ "$PHANTOMJS" != $SENCHA_TOOLS* ]] ;
then
	PATH=$SENCHA_TOOLS:$PATH
fi

#clean out old files
rm -rf build
rm -f app.jsb3
rm -f app-all.js

#build stanging dest
mkdir build
mkdir build/$EXT
mkdir build/$EXT/resources
mkdir build/$EXT/resources/themes

# copy files into build dest
cp -R resources build
cp -R $EXT/resources/css build/$EXT/resources
cp -R $EXT/resources/themes/images build/$EXT/resources/themes
cp $EXT/ext.js build/$EXT

# clean out .svn directories and hidden files
find build -name .\* | xargs rm -rf

mv build/resources/hangout-app.xml build
cp index.html build
cp config-example.js build/config.js

#change the index.html to point to build resources.
sed -i "" 's/\"src\/main\/app\.js\"/\"app\.js\"/g' build/index.html
sed -i "" 's/ext-debug\.js\"/ext\.js\"/g' build/index.html


# fire up an http server in the background
echo "Starting SimpleHTTP Server"
python -m SimpleHTTPServer $PORT >/dev/null 2>&1 &

#generate project file
sencha create jsb -a http://localhost:$PORT/index.html -p app.jsb3

#kill the http server
echo "Stopping Simple HTTP Server"
HPID=`jobs -l 1 | awk '{print $2}'`
kill -9 $HPID


#modify project file with values instead of 'placeholders'
sed -i "" 's/\"Project Name\"/\"Application\"/g' app.jsb3
sed -i "" 's/Company Name\"/NextThought LLC\"/g' app.jsb3
sed -i "" 's/\"app.js\"/\"src\/main\/app\.js\"/g' app.jsb3

#perform build
sencha build -p app.jsb3 -d .

#clean out artifact files not needed anymore
rm -f app.jsb3
rm -f all-classes.js

#move resultant minified code into build dest
mv app-all.js build/app.js

# package build
cd build
zip -r ../build-r$REVISION.zip . >/dev/null

#final cleanup
cd ..
rm -rf build
