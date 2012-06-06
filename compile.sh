#!/usr/bin/python
# either, make a phantomjs script that reads all the dependencies using ExtJS's class loader...
# Or... read each js file and parse the requires dependency tree and order the files our selves...
# then, use that list to read our files into Google Closure compiler to minify our code.

import httplib, urllib, sys,json,os
from pprint import pprint


def doWebServiceCompile(files):
	opts = [
	    ('compilation_level', 'ADVANCED_OPTIMIZATIONS'),
	    # ('create_source_map', 'app.min.js.map'),
	    # ('source_map_format', 'V3'),
	    ('output_format', 'text'),
	    ('output_info','compiled_code')]

	for i in files:
		file = open(i)
		opts.append( ('js_code', file.read() ) )
		file.close()

	params = urllib.urlencode(opts)
	headers = { "Content-type": "application/x-www-form-urlencoded" }
	conn = httplib.HTTPConnection('closure-compiler.appspot.com')
	conn.request('POST', '/compile', params, headers)
	print "Sent, waiting for response..."
	response = conn.getresponse()
	data = response.read()
	conn.close
	file = open('app.min.js','w')
	file.write(data)
	file.close()
