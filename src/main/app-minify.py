#!/usr/bin/env python
# either, make a phantomjs script that reads all the dependencies using ExtJS's class loader...
# Or... read each js file and parse the requires dependency tree and order the files our selves...
# then, use that list to read our files into Google Closure compiler to minify our code.
from __future__ import print_function, unicode_literals

import json
import os
import re
import subprocess
import sys
import time

def _readSenchaProjectFile( filename ):
	data = None
	with open(filename, 'rb') as file:
		data = json.loads( file.read() )

	return data

def _fixProjectFile( projectFile ):
	# Remove MathQuill from the project
	for item in ((projectFile['builds'])[0])['files']:
		if 'mathquill' in item['path']:
			(((projectFile['builds'])[0])['files']).remove(item)

	# Fix build target
	((projectFile['builds'])[1])['target'] = "javascript/app.min.js"

	# Fix the path to app.js
	for item in ((projectFile['builds'])[1])['files']:
		if 'app.js' in item['name']:
			item['path'] = "javascript/"
	
	return projectFile

def _buildRefIndexHTML( filename ):
	lines = []
	with open( filename, 'rb' ) as file:
                lines=file.readlines()

	result = []
	for line in lines:
		line = line.replace('ext-all.js', 'ext.js').replace('https://extjs.cachefly.net', '')
		
		if '[analytics code here]' in line:
			continue

		result.extend([line])

	with open( 'index-ref.html', 'wb' ) as file:
		file.write(''.join(result))

def _buildMinifyIndexHTML( filename ):
	lines = []
	with open( filename, 'rb' ) as file:
		lines=file.readlines()

	buildtime = time.strftime('%Y%m%d%H%M%S')
	result = []
	for line in lines:
		line = line.replace('ext-all.js', 'ext.js')
		line = line.replace('favicon.ico', 'favicon.ico?_dc=%s' % (buildtime, ))
		line = line.replace('mathquill.css', 'mathquill.css?_dc=%s' % (buildtime, ))
		line = line.replace('main.css', 'main.css?_dc=%s' % (buildtime, ))
		line = line.replace('base64.min.js', 'base64.min.js?_dc=%s' % (buildtime, ))
		line = line.replace('config.js', 'config.js?_dc=%s' % (buildtime, ))
		line = line.replace('app.js', 'app.min.js?_dc=%s' % (buildtime, ))

		if 'on deploy' in line:
			continue
		elif 'jQuery.noConflict();' in line:
			line = ''.join([line, '        <script type="text/javascript" src="resources/lib/mathquill/mathquill.min.js?_dc=%s"></script>\n' % (buildtime, )])

		result.extend([line])

	with open( 'index-minify.html', 'wb' ) as file:
		file.write(''.join(result))

def main():
	_buildRefIndexHTML( 'index.html' )

	sencha = "/Applications/SenchaSDKTools-2.0.0-beta3/sencha"

	args = "create jsb -p minify.jsb3 -a http://localhost/NextThoughtWebApp/index-ref.html?_dc=%s" % (time.strftime('%Y%m%d%H%M%S'), )
	subprocess.check_call((sencha, args))

	data = _readSenchaProjectFile( 'minify.jsb3' )
	data = _fixProjectFile(data)

	with open('minify.jsb3', 'wb') as file:
		json.dump(data, file, indent=0)

	args = "build -p minify.jsb3 -d ."
	subprocess.check_call((sencha, args))

	_buildMinifyIndexHTML( 'index.html' )

	# Clean-up
	os.remove('all-classes.js')
	os.remove('minify.jsb3')
	os.remove('index-ref.html')

if __name__ == '__main__':
        main()
