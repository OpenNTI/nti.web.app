export default Ext.define('NextThought.app.profiles.user.components.activity.Body', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-user-activity-body',

	requires: [
		'NextThought.app.profiles.user.components.activity.parts.Stream',
		'NextThought.app.profiles.user.components.activity.parts.NewPost',
		'NextThought.app.windows.Actions',
		'NextThought.app.blog.Window'
	],

	layout: 'none',

	cls: 'activity',

	items: [
		{xtype: 'profile-user-newpost'},
		{xtype: 'profile-user-activity-stream'}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.setUpComponents();

		this.WindowActions = NextThought.app.windows.Actions.create();

		this.activityCmp.navigateToObject = this.navigateToActivityItem.bind(this);
		this.newPostCmp.onNewPost = this.onNewPost.bind(this);

		this.newPostCmp.hide();

		this.on({
			'activate': this.onActivate.bind(this),
			'deactivate': this.onDeactivate.bind(this)
		});
	},


	onActivate: function() {
		this.activityCmp.fireEvent('activate');
	},


	onDeactivate: function() {
		this.activityCmp.fireEvent('deactivate');
	},


	setUpComponents: function() {
		this.newPostCmp = this.down('profile-user-newpost');
		this.activityCmp = this.down('profile-user-activity-stream');
	},


	onNewPost: function() {
		if (this.postContainer && this.postContainer.getLink('add')) {
			this.WindowActions.showWindow('new-blog', null, this.newPostCmp.el.dom, {afterSave: this.onPostSaved.bind(this)}, {
				blog: this.postContainer
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
		this.activeEntity = entity;

		var me = this,
			collection = Service.getCollection('Blog'),
			href = collection && collection.href;

		// Update the activityCmp with the new user entity.
		this.activityCmp.userChanged(entity);

		if (!href || !isMe(entity) || !Service.canBlog()) {
			me.newPostCmp.hide();
			return Promise.resolve();
		}

		return Service.request(href)
			.then(function(resp) {
				return ParseUtils.parseItems(resp)[0];
			})
			.then(function(blog) {
				me.postContainer = blog;

				if (blog.getLink('add')) {
					me.newPostCmp.show();
				} else {
					me.newPostCmp.hide();
				}
			});
	},


	setStreamSource: function(store, entity) {
		this.activityCmp.setStreamSource(store, entity);
	},


	setStreamParams: function(params) {
		this.activityCmp.setStreamParams(params);
	},


	navigateToActivityItem: function(item, monitors) {
		if (this.navigateToObject) {
			this.navigateToObject(item, monitors);
		}
	}
});
