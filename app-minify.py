#!/usr/bin/env python
from __future__ import print_function, unicode_literals

from argparse import ArgumentParser
import os
import subprocess
import time
import gzip

BUILDTIME = time.strftime('%Y%m%d%H%M%S')

def _buildIndexHtml( minify, analytics_key='', app_root='.', itunes_id=None ):
	bust_cache = """\t\t\t<script type="text/javascript">window.disableCaching = true;</script>""" + '\n'

	analytics_domain = 'nextthought.com'
	if ',' in analytics_key:
		analytics_key, analytics_domain = analytics_key.split(',')

	analytics = """
<script type="text/javascript">
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', '%s', '%s');
ga('send', 'pageview');
</script>
""" % (analytics_key, analytics_domain)

	lines = []
	input_file = 'index.html.in'
	if minify:
		input_file = 'index.html.out'
	with open( os.path.join( app_root, input_file ), 'rb' ) as file:
		lines = file.readlines()

	output = []
	in_bootstrap = False
	for line in lines:
		if minify and in_bootstrap:
			if '</x-bootstrap>' in line:
				in_bootstrap = False
			continue
		line = line.replace( 'main.css', 'main.css?dc=%s' % BUILDTIME )
		if minify:
			line = line.replace( '"app/js/app.min.js"', '"/app/js/app.min.js?dc=%s"' % BUILDTIME )
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
		elif '<!-- x-itunes -->' in line and itunes_id:
			line = '<meta name="apple-itunes-app" content="app-id=%s" />\n' % itunes_id

		output.append(line)

	return ''.join(output)

def _buildMinifyIndexHtml(analytics_key, itunes_id):
	contents = _buildIndexHtml( True, analytics_key, itunes_id=itunes_id )

	with open( 'index-minify.html', 'wb' ) as file:
		file.write(contents)

def _buildUnminifyIndexHtml(analytics_key, itunes_id):
	contents = _buildIndexHtml( False, analytics_key, itunes_id=itunes_id )

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

def _minify_app( app_root, extjs_sdk, closure ):
	output_file = 'app/js/app.min.js'

	sencha_bootstrap_command = [ '../../../../parts/senchacmd/sencha',
				     '-sdk', extjs_sdk,
				     'compile',
				     '-classpath=js/app.js,js/NextThought',
				     'meta', '-alias',
				     '-out', 'bootstrap.js',
				     'and',
				     'meta', '-alt', '-append', '-out', 'bootstrap.js' ]
	sencha_compile_command = [
		'../../../../parts/senchacmd/sencha',
		'-sdk', extjs_sdk,
		'compile',
		'-classpath=js/app.js,js/NextThought',
		'exclude', '-namespace', 'Ext.diag',
		'and',
		'-option', 'debug:false',
		'page',
		'-r', # Remove text references
		'-str', # Strip comments
		'-y', # YUI compressor
	]
	if closure:
		sencha_compile_command.append('--closure')  # Compress with closure compiler
		#'-u', # uglify...doesn't work "[ERR] java.lang.UnsupportedOperationException: Not Yet Implemented]"
	sencha_compile_command.extend([
		'-cla', output_file, # class file
		'-i', 'index.html.in',
		'-o', 'index.html.out'
	])

	subprocess.check_call(sencha_bootstrap_command)
	subprocess.check_call(sencha_compile_command)

	gzip_files((output_file,))

def gzip_files(file_paths):
	"Compress files that are known to exist"
	# Write a .gz version for nginx http://nginx.org/en/docs/http/ngx_http_gzip_static_module.html
	for path in file_paths:
		gz_path = path + '.gz'
		path_mod_time = os.stat(path).st_mtime
		if not os.path.isfile(gz_path) or os.stat(gz_path).st_mtime < path_mod_time:
			with open(path, 'rb') as f:
				contents = f.read()
			with open( gz_path, 'wb' ) as f:
				gf = gzip.GzipFile( path, 'wb', 9, f, path_mod_time)
				gf.write(contents)
				gf.close()
			os.utime(gz_path, (path_mod_time, path_mod_time))


def main():
	parser = ArgumentParser()
	parser.add_argument('-a', '--google-analytics', dest='analytics_key', action='store', default='', help="Key value used with Google Analytics.  If no value is specified, then the index-minify.html will not contain Google Analytics code.")
	parser.add_argument('--app_root', dest='app_root', action='store', default='.', help="Directory of the App index.html file")
	parser.add_argument('--extjs_sdk', dest='extjs_sdk', action='store', default='ext-4.2', help="ExtJS SDK location")
	parser.add_argument('--closure', dest='closure', action='store_true', default=False, help="Apply the Closure compressor")
	parser.add_argument('--itunes', dest='itunes', action='store', default=None, help="The iTunes AppID to advertise")
	args = parser.parse_args()

	_minify_app(args.app_root, args.extjs_sdk, args.closure)

	_buildMinifyIndexHtml(args.analytics_key, args.itunes)
	_buildUnminifyIndexHtml(args.analytics_key, args.itunes)



	# Clean-up:
	if os.path.exists('index.html.out'):
		os.remove('index.html.out')

if __name__ == '__main__':
        main()
