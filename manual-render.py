#!/usr/bin/env python
from __future__ import print_function, unicode_literals

from argparse import ArgumentParser
import os
import time

BUILDTIME = time.strftime('%Y%m%d%H%M%S')

def _buildIndexHtml( analytics_key='', app_root='./src/main', itunes_id=None ):

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
	input_file = 'index.html'

	with open( os.path.join( app_root, input_file ), 'rb' ) as file:
		lines = file.readlines()

	output = []

	for line in lines:
		line = line.replace( 'main.css', 'main.css?dc=%s' % BUILDTIME )
		line = line.replace( 'legacy.css', 'legacy.css?dc=%s' % BUILDTIME )
		line = line.replace( 'site.css', 'site.css?dc=%s' % BUILDTIME )
		line = line.replace( 'react-with-addons.js', 'react-with-addons.min.js' )
		line = line.replace( 'react-dom.js', 'react-dom.min.js' )
		line = line.replace( 'config.js', 'config.js?dc=%s' % BUILDTIME )
		if 'index.js' in line:
			line = line.replace( 'index.js', 'index.js?dc=%s' % BUILDTIME )
		if '<!-- analytics -->' in line and analytics_key is not '':
			line = analytics
		elif '<!-- analytics -->' in line and analytics_key is '':
			line = ''
		elif '<!-- x-itunes -->' in line and itunes_id:
			line = '<meta name="apple-itunes-app" content="app-id=%s" />\n' % itunes_id

		output.append(line)

	return ''.join(output)

def _build(analytics_key, itunes_id):
	contents = _buildIndexHtml( analytics_key, itunes_id=itunes_id )

	with open( './dist/client/index.html', 'wb' ) as file:
		file.write(contents)


def main():
	parser = ArgumentParser()
	parser.add_argument('-a', '--google-analytics', dest='analytics_key', action='store', default='', help="Key value used with Google Analytics.  If no value is specified, then the index-minify.html will not contain Google Analytics code.")
	parser.add_argument('--itunes', dest='itunes', action='store', default=None, help="The iTunes AppID to advertise")
	args = parser.parse_args()

	_build(args.analytics_key, args.itunes)


if __name__ == '__main__':
	main()
