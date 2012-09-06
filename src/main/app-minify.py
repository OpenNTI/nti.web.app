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

SENCHA = "/Applications/SenchaSDKTools-2.0.0-beta3/sencha"

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

def _buildProjectFile( app_entry, projectfile ):
	phantomjs_script = '../../phantomjs-jsb.js'
	command = ['/usr/bin/env', 'phantomjs', '--debug=yes', phantomjs_script, '--app-entry', app_entry, '--project', projectfile]
	
	subprocess.call(command)

def _buildRefIndexHTML():
	contents = """<!DOCTYPE html>
<html lang="en">
<head>
    <title>NextThought</title>
	<meta http-equiv='Content-Type' content='Type=text/html; charset=utf-8'>
	<meta http-equiv="X-UA-Compatible" content="IE=edge">

	<script type="text/javascript" src="resources/misc/base64.min.js"></script>
	<!--[if gte IE 9]>
	<style type="text/css">
		.gradient { filter: none; }
	</style>
	<![endif]-->
</head>
<body>
	<script type="text/javascript" src="config.js"></script>

	<!-- jQuery library, for use with mathquill only -->
	<script type="text/javascript" src="resources/lib/jQuery-1.8.0min.js"></script>
	<script type="text/javascript"> jQuery.noConflict(); </script>
	<script type="text/javascript" src="resources/lib/mathquill/mathquill.min.js"></script>

        <script type="text/javascript"
                        src="/ext-4.1.1-gpl/ext.js"
                        id="ext-js-library"></script>

	<!-- application main entry -->
	<script type="text/javascript" src="javascript/app.js"></script>

	<!--[analytics code here]-->
</body>
</html>
"""

	with open( 'index-ref.html', 'wb' ) as file:
		file.write(contents)

def _buildMinifyIndexHTML():
	buildtime = time.strftime('%Y%m%d%H%M%S')

	contents = """<!DOCTYPE html>
<html lang="en">
<head>
    <title>NextThought</title>
	<meta http-equiv='Content-Type' content='Type=text/html; charset=utf-8'>
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
    <link rel="shortcut icon" href="resources/images/favicon.ico?_dc=%s">

	<link rel="stylesheet" id="ext-base" type="text/css"
		  href="https://extjs.cachefly.net/ext-4.1.1-gpl/resources/css/ext-all-gray.css">
	<link rel='stylesheet' type='text/css'
		  href='https://fonts.googleapis.com/css?family=Droid+Serif:400,700,700italic,400italic|Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800'>
	<link rel="stylesheet" id="mathquill-stylesheet" type="text/css"
		  href="resources/lib/mathquill/mathquill.css?_dc=%s">
    <link rel="stylesheet" id="main-stylesheet" type="text/css" href="resources/css/main.css?_dc%s">

	<script type="text/javascript" src="resources/misc/base64.min.js?_dc=%s"></script>
	<!--[if gte IE 9]>
	<style type="text/css">
		.gradient { filter: none; }
	</style>
	<![endif]-->
</head>
<body>
	<div id="loading-mask">
		<div class="x-mask"></div>
		<div class="x-mask-msg" id="loading"><div>Loading...</div></div>
	</div>

	<script type="text/javascript" src="config.js?_dc=%s"></script>

	<!-- jQuery library, for use with mathquill only -->
	<script type="text/javascript" src="resources/lib/jQuery-1.8.0min.js?_dc=%s"></script>
	<script type="text/javascript"> jQuery.noConflict(); </script>
	<script type="text/javascript" src="resources/lib/mathquill/mathquill.min.js?_dc=%s"></script>

	<!-- application main entry -->
	<script type="text/javascript" src="javascript/app.min.js?_dc=%s"></script>

	<!--[analytics code here]-->
</body>
</html>
""" % (buildtime, buildtime, buildtime, buildtime, buildtime, buildtime, buildtime, buildtime)

	with open( 'index-minify.html', 'wb' ) as file:
		file.write(contents)

def _closure_minify( projectFile ):	
	cmd = '/usr/bin/java'
	optimization_level = 'WHITESPACE_ONLY'
	output_file = 'javascript/app.min.js'

	command = [cmd, "-jar", "../../closure-compiler.jar", "--compilation_level", optimization_level, "--js_output_file", "javascript/app.min.js"]

	command.extend(['--js', '../ext-4.1.1-gpl/ext.js'])
	for item in ((projectFile['builds'])[0])['files']:
		command.extend(['--js', os.path.join(item['path'], item['name'])])
	command.extend(['--js', 'javascript/app.js'])

	subprocess.call(command)


def _sencha_minify( projectfile ):

	with open('minify.jsb3', 'wb') as file:
		json.dump(projectfile, file, indent=0)

	args = "build -p minify.jsb3 -d ."
	subprocess.check_call((SENCHA, args))

def main():
	_buildRefIndexHTML()

	app_entry = 'http://localhost/NextThoughtWebApp/index-ref.html'
	projectfilename = 'minify.jsb3'
	_buildProjectFile( app_entry, projectfilename )

	projectfile = _readSenchaProjectFile( projectfilename )
	projectfile = _fixProjectFile(projectfile)

	_closure_minify(projectfile)

	_buildMinifyIndexHTML()

	# Clean-up
	os.remove( projectfilename )
	os.remove('index-ref.html')

if __name__ == '__main__':
        main()
