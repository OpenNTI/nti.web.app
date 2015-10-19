Ext.define('NextThought.app.profiles.user.components.about.parts.Groups', {
	extend: 'NextThought.app.profiles.user.components.about.parts.Membership',
	alias: 'widget.profile-user-about-groups',

	cls: 'memberships preview group',
	title: 'Groups',

	limit: 4,
	
	profileRouteRoot: '/group',

	entryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'entry', 'data-route': '{route}', cn: [
			'{group:avatar}',
			{cls: 'name', html: '{name}'}
		]
	})),


	setUser: function(user, isMe) {
		var me = this;

		me.removeAll();

		user.getGroupMembership()
			.then(function(groups) {
				if (groups.length) {
					if(groups.length <= me.limit){
						me.seeAllEl.hide();
					}
					groups.slice(0, me.limit)
						.map(function(group) {
							return {
								group: group,
								name: group.getName(),
								route: ParseUtils.encodeForURI(group.getId())
							};
						})
						.forEach(me.addEntry.bind(me));
				//if there are no groups hide this cmp
				} else {
					me.hide();
				}
			});
	},


	getValues: function() {}
});
