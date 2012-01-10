#!/bin/bash
#export SELENIUM_HOST=127.0.0.1
#export SELENIUM_PORT=4444
#export SELENIUM_BIND=127.0.0.1

export SELENIUM_DRIVER=*googlechrome
#export SELENIUM_DRIVER=*chrome
#export SELENIUM_DRIVER=*firefox

export SELENIUM_JAR=~/Applications/bin/selenium-server-standalone-2.16.1.jar

#port for the simpleserver
export PORT=8181

# fire up an http server in the background
echo "Starting SimpleHTTP Server"
python -m SimpleHTTPServer $PORT >/dev/null 2>&1 &

nosetests-2.7 -v -d -w ./src/test/python/

# kill the http server
echo "Stopping Simple HTTP Server"
HPID=`jobs -l 1 | awk '{print $2}'`
kill -9 $HPID



