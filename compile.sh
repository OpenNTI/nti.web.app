#!/usr/bin/python

import httplib, urllib, sys,json,os
from pprint import pprint

if(len(sys.argv) < 2):
	print "provide a jsb3 file to build"
	sys.exit(1)

json_data = open(sys.argv[1])
data = json.load(json_data)
json_data.close()

files = [{'path':'lib/ext-4.0.7/', 'name':'ext.js'}]
files.extend( data['builds'][0]['files'] );
files.append( data['builds'][1]['files'][1] )

if os.system('which java > /dev/null') == 1:
	opts = ['java', '-jar lib/compiler.jar', '--compilation_level ADVANCED_OPTIMIZATIONS', '--create_source_map ./app.min.js.map', '--source_map_format=V3', '--js_output_file app.min.js']
	for i in files:
		opts.append('--js '+i['path']+i['name'])
	os.system(' '.join(opts))
else:
	opts = [
	    ('compilation_level', 'ADVANCED_OPTIMIZATIONS'),
	    # ('create_source_map', 'app.min.js.map'),
	    # ('source_map_format', 'V3'),
	    ('output_format', 'text'),
	    ('output_info','compiled_code')]

	for i in files:
		file = open(i['path']+i['name'])
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
