var path = require('path');
var webpack = require('webpack');
var root = path.join(__dirname, '..', 'src', 'main', 'js');
var modules = path.join(__dirname, '..', 'node_modules');
var NodeModulesThatNeedCompiling = [];

function isOurModule(s) {
	var ourprojects = NodeModulesThatNeedCompiling.join('|');
	var ours = new RegExp(ourprojects);

	var dir = path.resolve(__dirname, '..');

	if (s.indexOf(dir) === 0) {
		s = s.substr(dir.length);
	}

	if (ours.test(s)) {
		//ignore node_modules in our libraries
		s = s.split(new RegExp('(' + ourprojects + ')/node_modules')).pop();
		//still ours?
		return ours.test(s);
	}
	return false;
}

function excludeNodeModulesExceptOurs(s) {
	if (/(node_modules|resources\/vendor)/.test(s)) {
		return !isOurModule(s);
	}
	return false;
}

var commonLoaders = [
	// { test: /\.json$/, loader: 'json' },
	{ test: /\.js(x?)$/,
		loader: 'babel?optional[]=runtime',
		exclude: excludeNodeModulesExceptOurs
	}

	// { test: /\.(ico|gif|png|jpg|svg)$/, loader: 'url?limit=100000&name=resources/images/[name].[ext]&mimeType=image/[ext]' },

	// { test: appFontName, loader: 'url' },
	// {
	// 	test: function(s) {
	// 		if (/woff$/.test(s)) {
	// 			return !appFontName.test(s);
	// 		}

	// 		return /\.(eot|ttf)$/.test(s);
	// 	},
	// 	loader: 'file',
	// 	query: {
	// 		name: 'resources/fonts/[name].[ext]'
	// 	}
	// }

];

module.exports = {
	name: 'browser',
	output: {
		path: '<%= pkg.stage %>/client/',
		// filename: 'js/[hash].js',
		filename: 'js/app.js',
		chunkFilename: 'js/[hash]-[id].js',
		publicPath: '<%= pkg.public_root %>'
	},

	cache: true,
	devtool: 'source-map',

	entry: '<%= pkg.src %>/js/app.js',

	target: 'web',
	stats: {
		colors: true,
		reasons: true
	},

	node: {
		net: 'empty',
		tls: 'empty',
		request: 'empty'
	},
	externals: [
		{
			request: true
		}
	],

	resolve: {
		root: [root, modules],
		extensions: ['', '.jsx', '.js', '.json', '.css', '.scss', '.html']
	},

	module: {
		loaders: commonLoaders
		// loaders: commonLoaders.concat([
		// 	{ test: /\.(s?)css$/, loader: ExtractTextPlugin.extract(
		// 		'style-loader',
		// 		(global.distribution
		// 			? 'css?-minimize!autoprefixer!sass?'
		// 			: 'css?sourceMap!autoprefixer!sass?sourceMap&'
		// 		) + scssIncludes )
		// 	}
		// ])
	},


	plugins: [
		// new webpack.ProvidePlugin({
		// 	Ext: ''
		// })
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.DefinePlugin({
			SERVER: false,
			// 'build_source': gitRevision,
			'process.env': {
				// This has effect on the react lib size
				'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
			}
		})
		// new ExtractTextPlugin('resources/styles.css', {allChunks: true})
	]
};
