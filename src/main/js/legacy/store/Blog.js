const Ext = require('@nti/extjs');

require('legacy/proxy/reader/Json');

module.exports = exports = Ext.define('NextThought.store.Blog', {
	extend: 'Ext.data.Store',
	alias: 'store.blog',
	model: 'NextThought.model.forums.PersonalBlogEntry',

	proxy: {
		url: 'tbd',
		type: 'rest',
		reader: {
			type: 'nti',
			root: 'Items',
			totalProperty: 'TopicCount',
		},
		extraParams: {
			sortOn: 'createdTime',
			sortOrder: 'descending',
		},
		headers: { Accept: 'application/vnd.nextthought.collection+json' },
		model: 'NextThought.model.forums.PersonalBlogEntry',
	},

	remove: function (records) {
		this.callParent(arguments);

		Ext.each(records, function (record) {
			record.fireEvent('destroy', record);
		});
	},
});
