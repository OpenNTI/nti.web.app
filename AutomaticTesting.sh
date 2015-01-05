#!/bin/bash


#executes at 00:00 every day
# 0 0 * * * sh AutomaticTest.sh


#checkout a new version of the webapp from the server
mktemp -d tempWebApp
svn co https://repos.nextthought.com/svn/nti-svn/NextThoughtWebApp/trunk/ tempWebApp &> /dev/null
#set variables for path navigation
pushd .
pushd tempWebApp/
pushd src/
pushd main/
#make ext-4.2 directory
wget https://s3.amazonaws.com/dev.nextthought.com/ext-4.2.0-commercial.zip &> /dev/null
#open zip
tar -xjvf ext-4.2.0-commercial.zip &> /dev/null
#rename folder and remove zip file
mv ext-4.2.0.663/ ext-4.2
rm -rf ext-4.2.0-commercial.zip
#download and install sencha, then compile it
popd
popd
sencha -sdk src/main/ext-4.2 compile -classpath=src/main/javascript/NextThought meta -alias -out src/main/bootstrap.js and meta -alt -append -out src/main/bootstrap.js &> /dev/null
#change to test folder and install karma
cd src/test/
npm install &> /dev/null
#run karma & output to a file
karma start > output.txt
#change to folder holding this directory
popd
popd
#remove test directory
rm -rf tempWebApp
