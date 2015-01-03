// Karma configuration
// Generated on Thu Nov 07 2013 17:51:02 GMT-0600 (CST)

module.exports = function(config) {
	config.set({

		// base path, that will be used to resolve files and exclude
		basePath: './',


		// frameworks to use
		frameworks: ['jasmine'],


		// list of files / patterns to load in the browser
		files: [
			{pattern: 'ext-4.2/examples/ux/ajax/**/*', included: false},
			{pattern: 'resources/lib/**/*', included: false},
			{pattern: 'javascript/libs.js', included: false},
			{pattern: 'javascript/NextThought/**/*.js', included: false},
			{pattern: 'javascript/specs/**/*.js', included: false},
			'ext-4.2/ext-all-debug.js',
			'karma.paths.js',
			'bootstrap.js',
			'config.js',
			'javascript/app.js'
		],


		// list of files to exclude
		exclude: [],

		//preprocessors: { 'javascript/NextThought/**/*.js': ['coverage'] },

		//coverageReporter: { type: 'html', dir: 'coverage/' },

		// test results reporter to use
		// possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
		reporters: [
			'progress',
			//'coverage'
		],

		// web server port
		port: 9876,


		// enable / disable colors in the output (reporters and logs)
		colors: true,


		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_ERROR,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,


		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera (has to be installed with `npm install karma-opera-launcher`)
		// - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
		// - PhantomJS
		// - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
		browsers: ['PhantomJS'],


		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 60000,


		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: true

	});
};
