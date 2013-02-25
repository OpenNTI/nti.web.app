Ext.define('NextThought.store.Blog',{
	extend: 'Ext.data.Store',
	alias: 'store.blog',

	requires: [
		'NextThought.proxy.reader.Json'
	],
	model: 'NextThought.model.forums.PersonalBlogEntry',

	proxy: {
		url: 'tbd',
		type: 'rest',
		reader: {
			type: 'nti',
			root: 'Items',
			totalProperty: 'TopicCount'
		},
		headers: { 'Accept': 'application/vnd.nextthought.collection+json' },
		model: 'NextThought.model.forums.PersonalBlogEntry'
	}
});
