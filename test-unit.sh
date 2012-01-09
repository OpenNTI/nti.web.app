#!/bin/bash
PORT=45670
# fire up an http server in the background
echo "Starting SimpleHTTP Server"
python -m SimpleHTTPServer $PORT >/dev/null 2>&1 &

phantomjs ./src/test/javascript/run-jasmine.js http://localhost:$PORT/test.html

# kill the http server
echo "Stopping Simple HTTP Server"
HPID=`jobs -l 1 | awk '{print $2}'`
kill -9 $HPID
