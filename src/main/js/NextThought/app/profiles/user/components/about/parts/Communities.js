Ext.define('NextThought.app.profiles.user.components.about.parts.Communities', {
	extend: 'NextThought.app.profiles.user.components.about.parts.Membership',
	alias: 'widget.profile-user-about-communities',

	cls: 'memberships preview communities',
	title: 'Communities',

	entryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'entry', 'data-route': '{route}', cn: [
			'{community:avatar}',
			{cls: 'name', html: '{name}'}
		]
	})),


	setUser: function(user, isMe) {
		var me = this;

		user.getCommunities()
			.then(function(communities) {
				communities.slice(0, 4)
					.map(function(community) {
						return {
							community: community,
							name: community.getName(),
							route: ParseUtils.encodeForURI(community.getId())
						};
					})
					.forEach(me.addEntry.bind(me));
			});
	},


	getValues: function() {}
});
