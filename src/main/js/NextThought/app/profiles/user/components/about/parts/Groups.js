Ext.define('NextThought.app.profiles.user.components.about.parts.Groups', {
	extend: 'NextThought.app.profiles.user.components.about.parts.Membership',
	alias: 'widget.profile-user-about-groups',

	cls: 'memberships preview group',
	title: 'Groups',

	entryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'entry', 'data-route': '{route}', cn: [
			'{group:avatar}',
			{cls: 'name', html: '{name}'}
		]
	})),


	setUser: function(user, isMe) {
		var me = this;

		user.getGroups()
			.then(function(groups) {
				groups.slice(0, 4)
					.map(function(group) {
						return {
							group: group,
							name: group.getName(),
							route: ParseUtils.encodeForURI(group.getId())
						};
					})
					.forEach(me.addEntry.bind(me));
			});
	},


	getValues: function() {}
});
