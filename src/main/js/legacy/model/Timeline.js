var Ext = require('extjs');
var ModelBase = require('./Base');


module.exports = exports = Ext.define('NextThought.model.Timeline', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.ntitimeline',

	statics: {
		mimeType: 'application/vnd.nextthought.ntitimeline',

		fromOutlineNode: function(data) {
			return this.create({
				icon: data.thumbnail,
				description: data.desciption,
				label: data.label,
				href: data.json,
				desiredHeight: data.desiredHeight,
				desiredWidth: data.desiredWidth,
				NTIID: data.ntiid
			});
		}
	},


	fields: [
		{name: 'description', type: 'string'},
		{name: 'icon', type: 'string'},
		{name: 'label', type: 'string'},
		{name: 'suggested_inline', type: 'bool'},
		{name: 'desiredHeight', type: 'auto'},
		{name: 'desiredWidth', type: 'auto'},
		{name: 'href', type: 'string'}
	]
});
