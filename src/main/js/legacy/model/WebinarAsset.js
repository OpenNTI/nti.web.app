const Ext = require('@nti/extjs');

require('./Base');

module.exports = exports = Ext.define('NextThought.model.WebinarAsset', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.webinarasset',

	statics: {
		mimeType: 'application/vnd.nextthought.webinarasset',
	},

	fields: [
		{name: 'webinar', type: 'object'}
	]

});
