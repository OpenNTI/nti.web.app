const Ext = require('extjs');
const { encodeForURI, isNTIID } = require('nti-lib-ntiids');

const UserRepository = require('legacy/cache/UserRepository');

require('legacy/app/profiles/user/components/membership/parts/Membership');


module.exports = exports = Ext.define('NextThought.app.profiles.group.components.membership.parts.Users', {
	extend: 'NextThought.app.profiles.user.components.membership.parts.Membership',
	alias: 'widget.profile-group-membership-users',

	cls: 'memberships full group four-column',
	title: 'Members',
	profileRouteRoot: '/user',

	entryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'entry', 'data-route': '{route}', cn: [
			'{member:avatar}',
			{cls: 'name', html: '{name}'}
		]
	})),


	setUser (user, isMe) {
		var friends = user.get('friends');
		return this.setFriends(friends);
	},

	setFriends (friends) {
		this.removeAll();
		return UserRepository.getUser(friends)
			.then(members => {
				if (members.length) {
					members.map(member => this.addEntry(this.configForUser(member)));
				} else {
					this.showEmptyText('This group has no members');
				}
			});
	},

	configForUser (member) {
		const id = member.getId();
		return {
			member: member,
			name: member.getName(),
			route: isNTIID(id) ? encodeForURI(id) : encodeURIComponent(id)
		};
	}
});
