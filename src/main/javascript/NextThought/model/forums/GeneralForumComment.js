Ext.define('NextThought.model.forums.GeneralForumComment', {
	extend: 'NextThought.model.forums.GeneralPost',

	isComment: true,

	fields: [
		{ name: 'Deleted', type: 'boolean', persist: false }
	]
});
