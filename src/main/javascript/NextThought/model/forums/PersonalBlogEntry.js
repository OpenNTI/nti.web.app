Ext.define('NextThought.model.forums.PersonalBlogEntry', {
	extend: 'NextThought.model.forums.Topic',

	fields: [
		{ name: 'story', type: 'singleItem', persist: false }
	]
});


