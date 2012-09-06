#!/usr/bin/env python
# either, make a phantomjs script that reads all the dependencies using ExtJS's class loader...
# Or... read each js file and parse the requires dependency tree and order the files our selves...
# then, use that list to read our files into Google Closure compiler to minify our code.
from __future__ import print_function, unicode_literals

import httplib
import json
import os
import re
import subprocess
import sys
import time
import urllib2 as urllib

def _readSenchaProjectFile( filename ):
	data = None
	with open(filename, 'rb') as file:
		data = json.loads( file.read() )

	return data

def _fixProjectFile( projectFile ):
	for item in ((projectFile['builds'])[0])['files']:
		# Remove MathQuill from the project
		if 'mathquill' in item['path']:
			(((projectFile['builds'])[0])['files']).remove(item)

	# Fix build target
	((projectFile['builds'])[1])['target'] = "javascript/app.min.js"

	# Fix the path to app.js
	for item in ((projectFile['builds'])[1])['files']:
		if 'app.js' in item['name']:
			item['path'] = "javascript/"
	
	return projectFile

def _buildProjectFile( app_entry, projectFileName ):
	phantomjs_script = '../../phantomjs-jsb.js'
	command = ['/usr/bin/env', 'phantomjs', '--debug=yes', phantomjs_script, '--app-entry', app_entry, '--project', projectFileName]
	
	subprocess.call(command)

def _cacheExtJSFiles( projectFile ):
	host = 'https://extjs.cachefly.net'

	# Check ext.js
	path = '../ext-4.1.1-gpl'
	name = 'ext.js'
	if not os.path.exists( os.path.join(path, name) ):
		print('%s is not cached.' % (os.path.join(path, name), ))
		if not os.path.exists( path ):
			os.makedirs(path, 0755)
		r = urllib.urlopen('/'.join([ host, path.replace('../', ''), name ]))
		with open( os.path.join(path, name), 'wb' ) as file:
			file.write(r.read())

	# Check everything else
	for item in ((projectFile['builds'])[0])['files']:
		if 'ext-4.1.1' in item['path']:
			if not os.path.exists( os.path.join(item['path'], item['name'])):
				print('%s is not cached.' % (os.path.join(item['path'], item['name']), ))
				if not os.path.exists( item['path']):
					os.makedirs(item['path'], 0755)
				r = urllib.urlopen('/'.join([ host, (item['path']).replace('../', ''), item['name'] ]))
				with open( os.path.join(item['path'], item['name']), 'wb' ) as file:
					file.write(r.read())

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
                        src="https://extjs.cachefly.net/ext-4.1.1-gpl/ext.js"
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

	analytics = """        <script type="text/javascript">

	        var _gaq = _gaq || [];
                _gaq.push(['_setAccount', '%s']);
                _gaq.push(['_trackPageview']);
                (function() {
	                var ga = document.createElement('script');
                        ga.type = 'text/javascript';
                        ga.async = true;
                        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + 
                                '.google-analytics.com/ga.js';
                        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
                })();
        </script>""" % ('UA-22943650-2', )

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
%s
</body>
</html>
""" % (buildtime, buildtime, buildtime, buildtime, buildtime, buildtime, buildtime, buildtime, analytics)

	with open( 'index-minify.html', 'wb' ) as file:
		file.write(contents)

def _closure_minify( projectFile ):	
	cmd = '/usr/bin/java'
	optimization_level = 'WHITESPACE_ONLY'
	output_file = 'javascript/app.min.js'

	command = [cmd, "-jar", "../../closure-compiler.jar", "--compilation_level", optimization_level, "--js_output_file", "javascript/app.min.js"]

	command.extend(['--js', '../ext-4.1.1-gpl/ext.js'])
	for item in ((projectFile['builds'])[0])['files']:
		if 'https://extjs.cachefly.net/ext-4.1.1-gpl' in item['path']:
			item['path'] = (item['path']).replace('https://extjs.cachefly.net/ext-4.1.1-gpl','../ext-4.1.1-gpl')
		elif '../../extjs.cachefly.net/ext-4.1.1-gpl' in item['path']:
			item['path'] = (item['path']).replace('../../extjs.cachefly.net/ext-4.1.1-gpl','../ext-4.1.1-gpl')
		command.extend(['--js', os.path.join(item['path'], item['name'])])
	command.extend(['--js', 'javascript/app.js'])

	_cacheExtJSFiles( projectFile )

	subprocess.call(command)

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
	#os.remove( projectfilename )
	#os.remove('index-ref.html')

if __name__ == '__main__':
        main()
