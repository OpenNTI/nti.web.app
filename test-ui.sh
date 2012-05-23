#!/bin/bash
#export SELENIUM_HOST=127.0.0.1
#export SELENIUM_PORT=4444
#export SELENIUM_BIND=127.0.0.1

export SELENIUM_DRIVER=*googlechrome
#export SELENIUM_DRIVER=*chrome
#export SELENIUM_DRIVER=*firefox

export SELENIUM_JAR=~/Applications/bin/selenium-server-standalone-2.16.1.jar
export PORT=8181
export TEST_URL=http://dev/WebApp/

echo "Running tests at $TEST_URL"

#run tests
nosetests-2.7 -v -d -w ./src/test/python/
