const Ext = require('extjs');

require('./Base');

module.exports = exports = Ext.define('NextThought.model.LTIExternalToolAsset', {
	extend: 'NextThought.model.Base',

	statics: {
		mimeType: 'application/vnd.nextthought.ltiexternaltoolasset',
	},

	fields: [
		{name: 'title', type: 'string'},
		{name: 'description', type: 'string'},
		{name: 'ConfiguredTool', type: 'object'}
	],

});
