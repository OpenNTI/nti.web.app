const Ext = require('extjs');

require('./Base');

module.exports = exports = Ext.define('NextThought.model.ExternalToolAsset', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.contenttypes.presentation.lticonfiguredtool',

	fields: [
		{name: 'title', type: 'string'},
		{name: 'description', type: 'string'},
	],

});
