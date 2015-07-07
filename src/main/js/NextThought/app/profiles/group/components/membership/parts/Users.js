Ext.define('NextThought.app.profiles.group.components.membership.parts.Users', {
	extend: 'NextThought.app.profiles.user.components.membership.parts.Membership',
	alias: 'widget.profile-group-membership-users',

	cls: 'memberships full group',
	title: 'Members',

	entryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'entry', 'data-route': '{route}', cn: [
			'{group:avatar}',
			{cls: 'name', html: '{name}'}
		]
	})),


	setUser: function(user, isMe) {
		var me = this;

		me.removeAll();
		me.showEmptyText('This group has no members');
		return new Promise.resolve('no members');
//		user.getGroupMembership()
//			.then(function(groups) {
//				if (groups.length) {
//					groups.map(function(group) {
//						return {
//							group: group,
//							name: group.getName(),
//							route: ParseUtils.encodeForURI(group.getId())
//						};
//					})
//					.forEach(me.addEntry.bind(me));
//				} else if (isMe) {
//					//TODO: change this text
//					me.showEmptyText('You have no public groups.');
//				} else {
//					me.showEmptyText('This user has no public groups.');
//				}
//			});
	}
});
