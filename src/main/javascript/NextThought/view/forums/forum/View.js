Ext.define('NextThought.view.forums.forum.View', {
	extend: 'NextThought.view.forums.hierarchy.View',
	alias: 'widget.forums-forum-view',

	cls: 'topic-list-view',

	requires: [
		'NextThought.view.forums.forum.Body',
		'NextThought.view.forums.forum.Navigation'
	],

	navigation: { xtype: 'forums-forum-nav', margin: 0, override: true},
	body: { xtype: 'forums-forum-body'},

	storeCfg: {},

	model: 'NextThought.model.forums.CommunityForum',


	setCurrentBody: function() {
		this.callParent(arguments);

		if (this.up('[isCourseForum]')) {
			this.initCustomScrollOn('content', '.topic-list', {secondaryViewEl: '.topic-list-nav', altClass: 'forum-in-view', noBuffer: true});
		}
	},

	newRecordAdded: function() {
		if (this.body.store) {
			this.body.store.load();
		}
	},


	convertToRoot: function() {
		this.navigation.convertToRoot();
	}
});
