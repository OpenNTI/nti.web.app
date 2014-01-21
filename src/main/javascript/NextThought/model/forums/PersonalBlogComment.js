Ext.define('NextThought.model.forums.PersonalBlogComment', {
	extend: 'NextThought.model.forums.GeneralForumComment',

	fields: [
		{ name: 'Deleted', type: 'boolean', persist: false},
		{ name: 'FavoriteGroupingField', defaultValue: 'Thoughts', persist: false}
	]
});
