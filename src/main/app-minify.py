#!/usr/bin/env python
from __future__ import print_function, unicode_literals

from argparse import ArgumentParser
import os
import subprocess
import time

BUILDTIME = time.strftime('%Y%m%d%H%M%S')

def _buildIndexHtml( minify, analytics_key='', app_root='.' ):
	bust_cache = """        <script type="text/javascript">window.disableCaching = true;</script>""" + '\n'

	analytics = """    <script type="text/javascript">
        var _gaq = _gaq || [];
        _gaq.push(['_setAccount', '%s']);
        _gaq.push(['_setDomainName', 'nextthought.com']);
        _gaq.push(['_trackPageview']);
        (function() {
            var ga = document.createElement('script');
            ga.type = 'text/javascript';
            ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();
    </script>
""" % (analytics_key, )

	lines = []
	with open( os.path.join( app_root, 'index.html.in' ), 'rb' ) as file:
		lines = file.readlines()

	output = ''
	in_bootstrap = False
	for line in lines:
		if minify and in_bootstrap:
			if '</x-bootstrap>' in line:
				in_bootstrap = False
			continue
		line = line.replace( 'main.css', 'main.css?dc=%s' % BUILDTIME )
		if minify:
			line = line.replace( 'app.js', 'app.min.js?dc=%s' % BUILDTIME )
			if '<x-bootstrap>' in line:
				in_bootstrap = True
				continue
		else:
			if 'app.js' in line:
				line = bust_cache + line
			line = line.replace( 'bootstrap.js', 'bootstrap.js?dc=%s' % BUILDTIME )
			line = line.replace( 'app.js', 'app.js?dc=%s' % BUILDTIME )
		if '</x-compile>' in line and analytics_key is not '':
			line = line + analytics
		output = output + line

	return output

def _buildMinifyIndexHtml(analytics_key):
	contents = _buildIndexHtml( True, analytics_key )

	with open( 'index-minify.html', 'wb' ) as file:
		file.write(contents)

def _buildUnminifyIndexHtml(analytics_key):
	contents = _buildIndexHtml( False, analytics_key )

	with open( 'index-unminify.html', 'wb' ) as file:
		file.write(contents)

def _closure_compile( output_file, input_files, optimizations='WHITESPACE_ONLY' ):
	print('Executing the Closure Compiler')
	cmd = '/usr/bin/java'

	command = [ cmd,
		    "-jar", "../../closure-compiler.jar",
		    "--compilation_level", optimizations,
		    "--jscomp_off=internetExplorerChecks",
		    "--js_output_file", output_file ]

	for file in input_files:
		command.extend( ['--js', file ] )

	subprocess.check_call(command)

def _combine_javascript( output_file, input_files ):
	with open( output_file, 'wb' ) as output:
		for input_file in input_files:
			with open( input_file, 'rb' ) as input:
				for line in input.readlines():
					output.write( line )

def _minify_app( app_root, extjs_sdk ):
	libraries = [ 'resources/lib/jQuery-1.8.0min.js',
		      'resources/lib/jQuery-noconflict.js',
		      'resources/lib/mathquill/mathquill.min.js',
		      'resources/lib/swfobject.js',
		      'resources/lib/detect-zoom.js',
		      'resources/lib/rangy-1.3alpha.681/rangy-core.js',
		      'resources/lib/rangy-1.3alpha.681/rangy-textrange.js' ]
	library_file = 'libraries.js'
	app_core_file = 'app_core.js'
	app_main_files = [ 'javascript/libs.js',
			   'javascript/app.js' ]
	app_main_file = 'app_main.js'
	app_files = [ library_file,
		      app_core_file,
		      app_main_file ]
	output_file = 'javascript/app.min.js'

	sencha_bootstrap_command = [ 'sencha',
				     '-sdk', extjs_sdk,
				     'compile', '-classpath=javascript/NextThought',
				     'meta', '-alias', 
				     '-out', 'bootstrap.js',
				     'and',
				     'meta', '-alt', '-append', '-out', 'bootstrap.js' ]
	sencha_compile_command = [ 'sencha',
				   '-sdk', extjs_sdk,
				   'compile', '-classpath=javascript/NextThought',
				   'concat', '-r', '-st', '-y', 
				   '-o', app_core_file ]
	try:
		_closure_compile( library_file, libraries )
		_closure_compile( app_main_file, app_main_files )
		subprocess.check_call(sencha_bootstrap_command)
		subprocess.check_call(sencha_compile_command)
		_combine_javascript( output_file, app_files )
	finally:
		for file in app_files:
			if os.path.exists( file ):
				os.remove( file )
	
def main():
	parser = ArgumentParser()
	parser.add_argument('-a', '--google-analytics', dest='analytics_key', action='store', default='', help="Key value used with Google Analytics.  If no value is specified, then the index-minify.html will not contain Google Analytics code.")
	parser.add_argument('--app_root', dest='app_root', action='store', default='.', help="Directory of the App index.html file")
	parser.add_argument('--extjs_sdk', dest='extjs_sdk', action='store', default='ext-4.2', help="ExtJS SDK location")

	args = parser.parse_args()

	_minify_app(args.app_root, args.extjs_sdk)

	_buildMinifyIndexHtml(args.analytics_key)
	_buildUnminifyIndexHtml(args.analytics_key)

if __name__ == '__main__':
        main()
