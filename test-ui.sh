#!/bin/bash
#export SELENIUM_HOST=127.0.0.1
#export SELENIUM_PORT=4444
#export SELENIUM_BIND=127.0.0.1

export SELENIUM_DRIVER=*googlechrome
#export SELENIUM_DRIVER=*chrome
#export SELENIUM_DRIVER=*firefox

export SELENIUM_JAR=~/Applications/bin/selenium-server-standalone-2.16.1.jar

python ./src/test/python/base.py

#nosetests-2.7 -v -d


