Ext.define('NextThought.app.profiles.group.components.membership.parts.Users', {
	extend: 'NextThought.app.profiles.user.components.membership.parts.Membership',
	alias: 'widget.profile-group-membership-users',

	cls: 'memberships full group',
	title: 'Members',
	profileRouteRoot: '/user',

	entryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'entry', 'data-route': '{route}', cn: [
			'{member:avatar}',
			{cls: 'name', html: '{name}'}
		]
	})),


	setUser: function(user, isMe) {
		var me = this,
		   friends = user.get('friends');
	    return this.setFriends(friends);
	},
		   
	setFriends: function(friends){
		var me = this;
		me.removeAll();
		return UserRepository.getUser(friends)
		   .then(function(members) {
				 if (members.length) {
					members.map(function(member) {
								return {
								member: member,
								name: member.getName(),
								route: ParseUtils.encodeForURI(member.getId())
								};
								})
					.forEach(me.addEntry.bind(me));
				 } else {
					me.showEmptyText('This group has no members');
				 }
			});
	}
});
