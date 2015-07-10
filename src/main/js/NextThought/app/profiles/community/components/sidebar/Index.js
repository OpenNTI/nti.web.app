Ext.define('NextThought.app.profiles.community.components.sidebar.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-community-sidebar',

	requires: [
		'NextThought.app.profiles.community.components.sidebar.parts.About',
		'NextThought.app.profiles.community.components.sidebar.parts.Topics',
		'NextThought.app.profiles.community.components.sidebar.parts.Membership'
	],

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
		},
		{
			xtype: 'container',
			layout: 'none',
			cls: 'card',
			items: [
				{xtype: 'profile-community-sidebar-memberships'}
			]
		}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.aboutCmp = this.down('profile-community-about');
		this.topicsCmp = this.down('profile-community-topics');
		this.membershipCmp = this.down('profile-community-sidebar-memberships');

		this.topicsCmp.showForum = this.showForum.bind(this);

		this.membershipCmp.gotoMembership = this.gotoMembership.bind(this);
	},


	updateEntity: function(entity, activeTopic) {
		this.aboutCmp.updateEntity(entity);
		this.topicsCmp.updateEntity(entity, activeTopic);
		this.membershipCmp.updateEntity(entity);
	}
});
