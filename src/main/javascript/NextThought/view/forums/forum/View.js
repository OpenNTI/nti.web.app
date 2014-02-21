Ext.define('NextThought.view.forums.forum.View', {
	extend: 'NextThought.view.forums.hierarchy.View',
	alias: 'widget.forums-forum-view',

	cls: 'topic-list-view',

	requires: [
		'NextThought.view.forums.forum.Body',
		'NextThought.view.forums.forum.Navigation'
	],

	navigation: { xtype: 'forums-forum-nav'},
	body: { xtype: 'forums-forum-body'},

	storeCfg: {},


	setCurrentBody: function() {
		this.callParent(arguments);

		this.initCustomScrollOn('content', '.topic-list', {secondaryViewEl: '.nav-outline'});
	},

	newRecordAdded: function() {
		if (this.body.store) {
			this.body.store.load();
		}
	}
});
