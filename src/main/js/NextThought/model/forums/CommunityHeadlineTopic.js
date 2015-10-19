Ext.define('NextThought.model.forums.CommunityHeadlineTopic', {
	extend: 'NextThought.model.forums.HeadlineTopic',

	mixins: {
		publishActions: 'NextThought.mixins.ModelWithPublish'
	}
});
