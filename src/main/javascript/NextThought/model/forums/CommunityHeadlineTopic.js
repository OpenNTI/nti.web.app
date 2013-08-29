Ext.define('NextThought.model.forums.CommunityHeadlineTopic', {
	extend: 'NextThought.model.forums.GeneralHeadlineTopic',

	mixins: {
		publishActions: 'NextThought.mixins.ModelWithPublish'
	}
});
