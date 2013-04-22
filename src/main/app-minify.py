#!/usr/bin/env python
from __future__ import print_function, unicode_literals

from argparse import ArgumentParser
import os
import subprocess
import time

BUILDTIME = time.strftime('%Y%m%d%H%M%S')

def _buildIndexHtml( minify, analytics_key='', app_root='.' ):
	bust_cache = """\t\t\t<script type="text/javascript">window.disableCaching = true;</script>""" + '\n'

	analytics = """\t<script type="text/javascript">
\t\tvar _gaq = _gaq || [];
\t\t_gaq.push(['_setAccount', '%s']);
\t\t_gaq.push(['_setDomainName', 'nextthought.com']);
\t\t_gaq.push(['_trackPageview']);
\t\t(function() {
\t\t\tvar ga = document.createElement('script');
\t\t\tga.type = 'text/javascript';
\t\t\tga.async = true;
\t\t\tga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
\t\t\tvar s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
\t\t})();
\t</script>
""" % (analytics_key, )

	lines = []
	input_file = 'index.html.in'
	if minify:
		input_file = 'index.html.out'
	with open( os.path.join( app_root, input_file ), 'rb' ) as file:
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
			line = line.replace( 'app.min.js', 'app.min.js?dc=%s' % BUILDTIME )
			if '<x-bootstrap>' in line:
				in_bootstrap = True
				continue
		else:
			if 'app.js' in line:
				line = bust_cache + line
			line = line.replace( 'bootstrap.js', 'bootstrap.js?dc=%s' % BUILDTIME )
			line = line.replace( 'app.js', 'app.js?dc=%s' % BUILDTIME )
		if '<!-- analytics -->' in line and analytics_key is not '':
			line = analytics
		elif '<!-- analytics -->' in line and analytics_key is '':
			line = ''
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
	output_file = 'javascript/app.min.js'

	sencha_bootstrap_command = [ 'sencha',
				     '-sdk', extjs_sdk,
				     'compile', 
				     '-classpath=javascript/libs.js,javascript/app.js,javascript/NextThought',
				     'meta', '-alias', 
				     '-out', 'bootstrap.js',
				     'and',
				     'meta', '-alt', '-append', '-out', 'bootstrap.js' ]
	sencha_compile_command = [ 'sencha',
				   '-sdk', extjs_sdk,
				   'compile', 
				   '-classpath=javascript/libs.js,javascript/app.js,javascript/NextThought',
				   'exclude', '-namespace', 'Ext.diag',
				   'and',
				   '-option', 'debug:false',
				   'page',
				   '-r',
				   '-str',
				   '-y',
				   '-cla', output_file,
				   '-i', 'index.html.in',
				   '-o', 'index.html.out' ]

	subprocess.check_call(sencha_bootstrap_command)
	subprocess.check_call(sencha_compile_command)
	
def main():
	parser = ArgumentParser()
	parser.add_argument('-a', '--google-analytics', dest='analytics_key', action='store', default='', help="Key value used with Google Analytics.  If no value is specified, then the index-minify.html will not contain Google Analytics code.")
	parser.add_argument('--app_root', dest='app_root', action='store', default='.', help="Directory of the App index.html file")
	parser.add_argument('--extjs_sdk', dest='extjs_sdk', action='store', default='ext-4.2', help="ExtJS SDK location")

	args = parser.parse_args()

	_minify_app(args.app_root, args.extjs_sdk)

	_buildMinifyIndexHtml(args.analytics_key)
	_buildUnminifyIndexHtml(args.analytics_key)

	# Clean-up:
	if os.path.exists('index.html.out'):
		os.remove('index.html.out')

if __name__ == '__main__':
        main()
