#!/bin/bash
#export SELENIUM_HOST=127.0.0.1
#export SELENIUM_PORT=4444
#export SELENIUM_BIND=127.0.0.1

export SELENIUM_DRIVER=*googlechrome
#export SELENIUM_DRIVER=*chrome
#export SELENIUM_DRIVER=*firefox

export SELENIUM_JAR=~/Applications/bin/selenium-server-standalone-2.16.1.jar

export PORT=8181

if [[ ! -z $FLAGGED ]] ; then
	export TEST_URL=http://localhost/index.html
	#do dataserver setup...

else #just launch assuming everything is running
	echo "Starting SimpleHTTP Server"

	python -m SimpleHTTPServer $PORT >/dev/null 2>&1 &

	HPID=`jobs -l 1 | awk '{print $2}'`
	export TEST_URL=http://localhost:$PORT/index.html
fi


echo "Running tests at $TEST_URL"

#run tests
nosetests-2.7 -v -d -w ./src/test/python/



#shutdown/cleanup

if [[ ! -z $HPID ]] ; then
	# kill the http server
	echo "Stopping SimpleHTTP Server"
	kill -9 $HPID
fi



