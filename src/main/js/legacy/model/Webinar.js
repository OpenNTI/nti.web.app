const Ext = require('@nti/extjs');

require('./Base');

module.exports = exports = Ext.define('NextThought.model.Webinar', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.webinar',

	statics: {
		mimeType: 'application/vnd.nextthought.webinar',
	},

	// TODO: Get actual webinar fields

	fields: [
		{name: 'title', type: 'string'},
		{name: 'description', type: 'string'},
		{name: 'ConfiguredTool', type: 'object'},
		{name: 'icon', type: 'string'}
	],

	asDomData: function (root) {
		var data = {
			ntiid: this.get('NTIID'),
			icon: this.getIcon(root),
			title: this.get('title'),
			description: this.get('description'),
		};

		data.icon = data.icon && data.icon.url;

		return data;
	}

});
