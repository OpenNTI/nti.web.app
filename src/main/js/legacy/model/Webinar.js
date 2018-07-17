const Ext = require('@nti/extjs');

require('./Base');

module.exports = exports = Ext.define('NextThought.model.Webinar', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.webinar',

	statics: {
		mimeType: 'application/vnd.nextthought.webinar',
	},

	fields: [
		{name: 'subject', type: 'string'},
		{name: 'description', type: 'string'}
	]
});
