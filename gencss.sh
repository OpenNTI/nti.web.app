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

set -e
# Errors in the source prevent compression from working, so -c
if [ -e resources/scss/_main.scss ]; then
	rm resources/scss/_main.scss
fi
cd resources/scss
echo $(zeta pack main.scss 2>&1 >/dev/null)
cd ../..
mv resources/scss/_main.scss resources/css/main.css
echo "Done."
