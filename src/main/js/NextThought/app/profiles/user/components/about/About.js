Ext.define('NextThought.app.profiles.user.components.about.About', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-user-about',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	requires: [
		'NextThought.app.profiles.user.components.about.parts.About',
		'NextThought.app.profiles.user.components.about.parts.Communities',
		'NextThought.app.profiles.user.components.about.parts.Education',
		'NextThought.app.profiles.user.components.about.parts.Groups',
		'NextThought.app.profiles.user.components.about.parts.Positions',
		'NextThought.app.profiles.user.components.about.parts.Interests',
		'NextThought.app.profiles.user.components.about.parts.Suggested'
	],


	layout: 'none',
	cls: 'profile-about user-about',

	items: [
		{xtype: 'profile-user-about-about'},
		{xtype: 'profile-user-about-education'},
		{xtype: 'profile-user-about-positions'},
		{xtype: 'profile-user-about-interests'},
		{xtype: 'profile-user-about-suggested'},
		{xtype: 'profile-user-about-communities'},
		{xtype: 'profile-user-about-groups'}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.initRouter();

		this.addRoute('/', this.showAbout.bind(this));
		this.addRoute('/edit', this.showEdit.bind(this));

		this.addDefaultRoute('/');

		this.profileParts = [
			this.down('profile-user-about-about'),
			this.down('profile-user-about-education'),
			this.down('profile-user-about-positions'),
			this.down('profile-user-about-interests'),
			this.down('profile-user-about-suggested'),
			this.down('profile-user-about-communities'),
			this.down('profile-user-about-groups')
		];
	},


	userChanged: function(user, isMe) {
		if (this.activeUser === user) {
			return Promise.resolve();
		}

		var cmps = this.profileParts;

		this.activeUser = user;
		this.isMe = isMe;

		cmps = cmps.map(function(cmp) {
			return cmp.setUser(user, isMe);
		});

		return Promise.all(cmps);
	},


	setSchema: function(schema) {
		this.profileParts.forEach(function(part) {
			if (part.setSchema) {
				part.setSchema(schema);
			}
		});
	},


	showAbout: function() {
		this.setTitle('About');

		this.profileParts.forEach(function(part) {
			if (part.setUneditable) {
				part.setUneditable();
			}
		});

		this.removeCls('editing');
	},


	showEdit: function() {
		this.setTitle('About');

		if (!this.isMe) {
			this.replaceRoute('', '/');
			return;
		}

		this.profileParts.forEach(function(part) {
			if (part.setEditable) {
				part.setEditable();
			}
		});

		this.addCls('editing');
	}
});
