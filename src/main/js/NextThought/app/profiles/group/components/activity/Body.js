Ext.define('NextThought.app.profiles.group.components.activity.Body', {
	extend: 'NextThought.app.profiles.user.components.activity.Body',
	alias: 'widget.profile-group-activity-body',

	requires: [
		'NextThought.app.profiles.group.components.activity.parts.Stream',
		'NextThought.app.profiles.group.components.activity.parts.NewPost',
		'NextThought.app.windows.Actions'
	],

	layout: 'none',

	cls: 'activity',

	items: [
		{xtype: 'profile-group-newpost'},
		{xtype: 'profile-group-activity-stream'}
	],


	setUpComponents: function() {
		this.newPostCmp = this.down('profile-group-newpost');
		this.activityCmp = this.down('profile-group-activity-stream');
	},


	onNewPost: function() {
		if (this.postContainer && this.postContainer.getLink('add')) {
			this.WindowActions.showWindow('new-topic', null, this.newPostCmp.el.dom, {afterSave: this.onPostSaved.bind(this)}, {
				forum: this.postContainer
			});
		}
	},


	onPostSaved: function(record) {
		var store = this.activityCmp && this.activityCmp.store;

		if (store) {
			store.insert(0, record);
		}
	},


	userChanged: function(entity) {
		var me = this;

		delete me.postContainer;

		me.newPostCmp.hide();

		return entity.getDefaultForum()
			.then(function(forum) {
				me.postContainer = forum;

				if (!forum || !forum.getLink('add')) {
					me.newPostCmp.hide();
				} else {
					me.newPostCmp.show();
				}
			});
	}
});
