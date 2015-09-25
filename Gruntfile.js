/*eslint no-var: 0 strict: 0*/
'use strict';
var path = require('path');

var PROD = 'production';
var DEV = 'development';

module.exports = function(grunt) {
	// Let *load-grunt-tasks* require everything
	require('load-grunt-tasks')(grunt);

	var pkgConfig = grunt.file.readJSON('package.json');

	var env = /prod/i.test(grunt.option('environment')) ? PROD : DEV;
	process.env.NODE_ENV = env;

	pkgConfig.distSiteCSS = path.join(pkgConfig.dist, '/client/resources/css/sites/');
	pkgConfig.stageSiteCSS = path.join(pkgConfig.stage, '/client/resources/css/sites/');

	grunt.initConfig({

		pkg: pkgConfig,

		webpack: {
			// dist: require('./webpack/app.config.dist'),
			dist: require('./webpack/app.config')
		},

		// execute: {
		// 	dev: {
		// 		src: '<%= pkg.src %>/../server/index.js'
		// 	},
		// 	dist: {

		// 		src: '<%= pkg.dist %>/server/index.js'
		// 	}
		// },

		karma: {
			unit: {
				configFile: 'karma.conf.js'
			}
		},

		copy: {
			'stage-dist': {
				files: [
				// includes files within path
					{
						flatten: true,
						expand: true,
						src: ['<%= pkg.src %>/*'],
						dest: '<%= pkg.stage %>/client/',
						filter: 'isFile'
					},
					{
						cwd: '<%= pkg.src %>/resources/',
						expand: true,
						filter: 'isFile',
						src: ['**'],
						dest: '<%= pkg.stage %>/client/resources/'
					}
				]
			}
		},

		rename: {
			'stage-dist': {
				files: [
					{
						src: '<%= pkg.stage %>/client',
						dest: '<%= pkg.dist %>/client'
					}
				]
			}
		},

		clean: {
			dist: {
				files: [{
					dot: true,
					src: [
						'<%= pkg.dist %>/client/'
					]
				}]
			},

			stage: {
				files: [{
					dot: true,
					src: [
						'<%= pkg.stage %>'
					]
				}]
			},

			maps: ['<%= pkg.dist %>/**/*.map', '<%= pkg.dist %>/**/*.map.gz']
		}

		// eslint: {
		// 	// options: {
		// 	// 	quiet: true
		// 	// },
		// 	target: [
		// 		'<%= pkg.src %>/js/**/*.js',
		// 		'<%= pkg.src %>/js/**/*.jsx',
		// 		'<%= pkg.src %>/../server/**/*.js',
		// 		'<%= pkg.src %>/../test/**/*.js',
		// 		'<%= pkg.src %>/../webpack-plugins/**/*.js',
		// 		'*.js'
		// 	]
		// },

		// symlink: {
		// 	'link-dist': {
		// 		files: Object.keys(sites)
		// 			.map(function(alias) {
		// 				var site = sites[alias];
		// 				return site === alias
		// 					? null
		// 					: {src: '<%= pkg.distSiteCSS %>/' + site, dest: '<%= pkg.distSiteCSS %>/' + alias};
		// 			})
		// 			//remove null elements from the array
		// 			.filter(function (x) { return x; })
		// 	},

		// 	'link-widgets': {
		// 		files: []
		// 	}
		// }
	});



	grunt.registerTask('docs', ['react', 'jsdoc']);
	grunt.registerTask('lint', ['eslint']);
	grunt.registerTask('test', ['karma']);
	grunt.registerTask('default', ['serve']);

	grunt.registerTask('build', function (target) {
		target = target || 'dist';

		var buildSteps = [
			'clean:stage',
			'copy:stage-' + target,
			'webpack:' + target,
			'clean:' + target,
			'rename:stage-' + target,
			'clean:stage'
		];

		if (env === PROD) {
			buildSteps.push('clean:maps');
		}

		return grunt.task.run(buildSteps);

	});

	grunt.registerTask('serve', function (target) {
		if (target === 'dist') {
			return grunt.task.run([
				'build',
				'execute:dist'
			]);
		}

		grunt.task.run([
			'eslint',
			'execute:dev'
		]);
	});
};
