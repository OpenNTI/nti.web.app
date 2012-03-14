#!/bin/bash
FILE=resources/scss/main.scss
PATH=$PATH:/opt/local/Library/Frameworks/Python.framework/Versions/2.7/bin
HOME=$(cd "$(dirname "$0")"; pwd)
RESOURCES=$HOME/src/main/resources

if [ -z `which zeta` ]; then
	echo "Sass for Python is not installed"
	echo "run this command:"
	echo ""
	echo "    sudo easy_install zetalibrary"
	echo ""
	exit 1
fi


if [[ "$1" == "-w" ]] ; then

	if [ -z `which sass` ]; then
		echo "Sass is not installed, see: http://sass-lang.com"
		echo "run this command:"
		echo ""
		echo "    sudo gem install sass"
		echo ""
		exit 1
	fi

	sass --scss --watch $RESOURCES/scss:$RESOURCES/css
	exit
fi



set -e
# Errors in the source prevent compression from working, so -c
if [ -e $RESOURCES/scss/_main.scss ]; then
	rm $RESOURCES/scss/_main.scss
fi
cd $RESOURCES/scss
echo $(zeta pack main.scss 2>&1 >/dev/null) >&2
cd $HOME

rm -rf $RESOURCES/css
mkdir $RESOURCES/css
mv $RESOURCES/scss/_main.scss $RESOURCES/css/main.css
echo "Done."
