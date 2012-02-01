#!/bin/bash
FILE=resources/scss/main.scss
PATH=$PATH:/opt/local/Library/Frameworks/Python.framework/Versions/2.7/bin

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

	sass --scss --watch resources/scss:resources/css
	exit
fi



set -e
# Errors in the source prevent compression from working, so -c
if [ -e resources/scss/_main.scss ]; then
	rm resources/scss/_main.scss
fi
cd resources/scss
echo $(zeta pack main.scss 2>&1 >/dev/null) >&2
cd ../..
rm -rf resources/css
mkdir resources/css
mv resources/scss/_main.scss resources/css/main.css
echo "Done."
