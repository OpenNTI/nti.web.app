#!/bin/bash
PORT=45670

# make sure correct phantomjs is used
PHANTOMJS_VER=`phantomjs --version 2> /dev/null`
if [[ "$PHANTOMJS_VER" != 1.* ]] ; then
	echo 'wrong version of phantomjs, check path'
	exit 1
fi

cd src/test/WebApp
# fire up an http server in the background
echo "Starting SimpleHTTP Server"
python -m SimpleHTTPServer $PORT >/dev/null 2>&1 &
sleep 5 # sleep is required to make sure server is running

phantomjs ../javascript/run-jasmine.js http://localhost:$PORT

# kill the http server
echo "Stopping Simple HTTP Server"
HPID=`jobs -l 1 | awk '{print $2}'`
kill -9 $HPID
