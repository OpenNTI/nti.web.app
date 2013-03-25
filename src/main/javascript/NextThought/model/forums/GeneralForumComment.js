Ext.define('NextThought.model.forums.GeneralForumComment', {
	extend: 'NextThought.model.forums.GeneralPost',

	fields: [
		{ name: 'Deleted', type: 'boolean', persist: false }
	]
});
