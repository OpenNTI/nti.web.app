Ext.define('NextThought.model.forums.PersonalBlogComment', {
	extend: 'NextThought.model.forums.Post',

	fields: [
		{ name: 'Deleted', type: 'boolean', persist: 'False'}
	]
});
