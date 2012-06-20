from setuptools import setup, find_packages

entry_points = {
			
	'console_scripts': [
	],
}

setup(
	name = 'nti.seleniumtests',
	version = '0.0',
	author = 'NTI',
	description = 'NextThought Dataserver Selenium tests',
	classifiers=[
			"Development Status :: 2 - Pre-Alpha",
			"Intended Audience :: Developers",
			"Operating System :: OS Independent",
			"Programming Language :: Python"
		],

	install_requires = [ 'nti.dataserver',
						 'selenium >= 2.24.0',
						 'sst >= 0.2.1'
						],
	
	packages = find_packages('.'),
	package_dir = {'': '.'},
	include_package_data = True,
	namespace_packages=['nti',],
	zip_safe = False,
	entry_points = entry_points
	)
