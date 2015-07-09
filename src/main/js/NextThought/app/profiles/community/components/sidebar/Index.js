Ext.define('NextThought.app.profiles.community.components.sidebar.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-community-sidebar',

	requires: ['NextThought.app.profiles.community.components.sidebar.parts.About'],

	layout: 'none',

	cls: 'community-sidebar',

	items: [
		{
			xtype: 'container',
			layout: 'none',
			cls: 'card',
			items: [
				{xtype: 'profile-community-about'},
				{xtype: 'profile-community-topics'}
			]
		}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.aboutCmp = this.down('profile-community-about');
		this.topicsCmp = this.down('profile-community-topics');

		this.topicsCmp.showForum = this.showForum.bind(this);
	},


	updateEntity: function(entity, activeTopic) {
		this.aboutCmp.updateEntity(entity);
		this.topicsCmp.updateEntity(entity, activeTopic);
	}
});
