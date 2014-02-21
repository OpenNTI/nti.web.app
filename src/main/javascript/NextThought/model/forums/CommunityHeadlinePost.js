Ext.define('NextThought.model.forums.CommunityHeadlinePost', {
	extend: 'NextThought.model.forums.GeneralHeadlinePost',
	isAlwaysPublic: true,

	searchProps: ['body', 'title', 'tag']
});
