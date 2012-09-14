#!/usr/bin/env python
# either, make a phantomjs script that reads all the dependencies using ExtJS's class loader...
# Or... read each js file and parse the requires dependency tree and order the files our selves...
# then, use that list to read our files into Google Closure compiler to minify our code.
from __future__ import print_function, unicode_literals

import argparse
import httplib
import json
import os
import subprocess
import sys
import time
import urllib2 as urllib

BUILDTIME = time.strftime('%Y%m%d%H%M%S')

def _readSenchaProjectFile( filename ):
	data = None
	with open(filename, 'rb') as file:
		data = json.loads( file.read() )

	return data

def _fixSenchaProjectFile( projectFile ):
	for item in ((projectFile['builds'])[0])['files']:
		# Remove MathQuill from the project
		if 'mathquill' in item['path']:
			(((projectFile['builds'])[0])['files']).remove(item)

	# Added ext.js as the first source item
	item = {}
	item['path'] = 'https://extjs.cachefly.net/ext-4.1.1-gpl/'
	item['name'] = 'ext.js'
	item['clsName'] = 'Ext'
	(((projectFile['builds'])[0])['files']).insert(0, item)

	# Fix build target
	((projectFile['builds'])[1])['target'] = "javascript/app.min.js"

	# Fix the path to app.js
	for item in ((projectFile['builds'])[1])['files']:
		if 'app.js' in item['name']:
			item['path'] = "javascript/"
	
	return projectFile

def _buildProjectFile( app_entry ):
	print('Building Project File')
	phantomjs_script = '../../phantomjs-jsb.js'
	project_file_name = 'minify.jsb3'
	command = ['/usr/bin/env', 'phantomjs', '--debug=yes', phantomjs_script, '--app-entry', app_entry, '--project', project_file_name]
	
	try:
		subprocess.check_call(command)
		project_file = _fixSenchaProjectFile( _readSenchaProjectFile( project_file_name ) )
	finally:
		os.remove( project_file_name )

	return project_file

def _cacheExtJSFiles( projectFile ):
	host = 'https://extjs.cachefly.net'

	# Check for missing files and download them if necessary.
	for item in ((projectFile['builds'])[0])['files']:
		if 'ext-4.1.1' in item['path']:
			if not os.path.exists( os.path.join(item['path'], item['name'])):
				print('%s is not cached.' % (os.path.join(item['path'], item['name']), ))
				if not os.path.exists( item['path']):
					os.makedirs(item['path'], 0755)
				r = urllib.urlopen('/'.join([ host, (item['path']).replace('../', ''), item['name'] ]))
				with open( os.path.join(item['path'], item['name']), 'wb' ) as file:
					file.write(r.read())

def _buildIndexHtml( version, analytics_key ):
	part1 = """<!DOCTYPE html>
<html lang="en">
<head>
        <title>NextThought</title>
	<meta http-equiv='Content-Type' content='Type=text/html; charset=utf-8'>
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
"""
	part2 = """        <link rel="shortcut icon" href="resources/images/favicon.ico?_dc=%s">

	<link rel="stylesheet" id="ext-base" type="text/css"
		  href="https://extjs.cachefly.net/ext-4.1.1-gpl/resources/css/ext-all-gray.css">
	<link rel='stylesheet' type='text/css'
		  href='https://fonts.googleapis.com/css?family=Droid+Serif:400,700,700italic,400italic|Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800'>
        <link rel="stylesheet" id="mathquill-stylesheet" type="text/css"
		  href="resources/lib/mathquill/mathquill.css?_dc=%s">
        <link rel="stylesheet" id="main-stylesheet" type="text/css" href="resources/css/main.css?_dc%s">

""" % (BUILDTIME, BUILDTIME, BUILDTIME, BUILDTIME)
	part3 ="""	<!--[if gte IE 9]>
	<style type="text/css">
		.gradient { filter: none; }
	</style>
	<![endif]-->
</head>
"""
	part4 = """<body>
	<div id="loading-mask">
		<div class="x-mask"></div>
		<div class="x-mask-msg" id="loading"><div>Loading...</div></div>
	</div>
	<script type="text/javascript" src="config.js?_dc=%s"></script>

	<!-- jQuery library, for use with mathquill only -->
	<script type="text/javascript" src="resources/lib/jQuery-1.8.0min.js?_dc=%s"></script>
	<script type="text/javascript"> jQuery.noConflict(); </script>
	<script type="text/javascript" src="resources/lib/mathquill/mathquill.min.js?_dc=%s"></script>
""" % (BUILDTIME, BUILDTIME, BUILDTIME)

	part5a = """        <script type="text/javascript"
                        src="https://extjs.cachefly.net/ext-4.1.1-gpl/ext.js"
                        id="ext-js-library"></script>

"""
	part5b = """        <script type="text/javascript"
                        src="https://extjs.cachefly.net/ext-4.1.1-gpl/ext-all.js"
                        id="ext-js-library"></script>

"""
	part6a = """	<!-- application main entry -->
	<script type="text/javascript" src="javascript/app.js"></script>
"""
	part6b = """	<!-- application main entry -->
	<script type="text/javascript" src="javascript/app.min.js?_dc=%s"></script>
""" % (BUILDTIME,)
	part7 ="""</body>
</html>
"""
	analytics = """
        <!--[analytics code here]-->
        <script type="text/javascript">
	        var _gaq = _gaq || [];
                _gaq.push(['_setAccount', '%s']);
                _gaq.push(['_setDomainName', 'nextthought.com']);
                _gaq.push(['_trackPageview']);
                (function() {
	                var ga = document.createElement('script');
                        ga.type = 'text/javascript';
                        ga.async = true;
                        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + 
                                '.google-analytics.com/ga.js';
                        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
                })();
        </script>
""" % (analytics_key, )

	if version == 'ref':
		return part1 + part3 + part4 + part5a + part6a + part7
	elif version == 'minify':
		return part1 + part2 + part3 + part4 + part6b + analytics + part7
	elif version == 'unminify':
		return part1 + part2 + part3 + part4 + part5b + part6a + analytics + part7
	else:
		return ''

def _buildRefIndexHtml():
	contents = _buildIndexHtml( 'ref', None )

	with open( 'index-ref.html', 'wb' ) as file:
		file.write(contents)

def _buildMinifyIndexHtml(analytics_key):
	contents = _buildIndexHtml( 'minify', analytics_key )

	with open( 'index-minify.html', 'wb' ) as file:
		file.write(contents)

def _buildUnminifyIndexHtml(analytics_key):
	contents = _buildIndexHtml( 'unminify', analytics_key )

	with open( 'index-unminify.html', 'wb' ) as file:
		file.write(contents)

def _closureMinify( projectFile ):
	print('Minifying Project')
	cmd = '/usr/bin/java'
	optimization_level = 'WHITESPACE_ONLY'
	output_file = 'javascript/app.min.js'

	command = [cmd, "-jar", "../../closure-compiler.jar", "--compilation_level", optimization_level, "--js_output_file", ((projectFile['builds'])[1])['target']]

	for item in ((projectFile['builds'])[0])['files']:
		if 'https://extjs.cachefly.net/' in item['path']:
			item['path'] = (item['path']).replace('https://extjs.cachefly.net/','../')
		elif '../../extjs.cachefly.net/' in item['path']:
			item['path'] = (item['path']).replace('../../extjs.cachefly.net/','../')
		command.extend(['--js', os.path.join(item['path'], item['name'])])
	command.extend(['--js', 'javascript/app.js'])

	_cacheExtJSFiles( projectFile )

	subprocess.check_call(command)

def main():
	parser = argparse.ArgumentParser()
	parser.add_argument('-a', '--google-analytics', dest='analytics_key', action='store', default=None, help="Key value used with Google Analytics.  If no value is specified, then the index-minify.html will not contain Google Analytics code.")

	args = parser.parse_args()

	_buildRefIndexHtml()

	app_entry = 'index-ref.html'

	try:
		projectfile = _buildProjectFile( app_entry )
	finally:
		os.remove('index-ref.html')

	_closureMinify(projectfile)

	_buildMinifyIndexHtml(args.analytics_key)
	_buildUnminifyIndexHtml(args.analytics_key)

if __name__ == '__main__':
        main()
