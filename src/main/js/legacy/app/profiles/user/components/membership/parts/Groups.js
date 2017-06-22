const Ext = require('extjs');
const { encodeForURI, isNTIID } = require('nti-lib-ntiids');
require('./Membership');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.membership.parts.Groups', {
	extend: 'NextThought.app.profiles.user.components.membership.parts.Membership',
	alias: 'widget.profile-user-membership-groups',

	cls: 'memberships full group four-column',
	title: 'Groups',
	profileRouteRoot: '/group',

	entryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'entry', 'data-route': '{route}', cn: [
			'{group:avatar}',
			{cls: 'name', html: '{name}'}
		]
	})),


	setUser (user, isMe) {
		this.removeAll();

		user.getGroupMembership()
			.then(groups => {
				if (groups.length) {
					groups.map(group => {
						const id = group.getId();
						return {
							group: group,
							name: group.getName(),
							route: isNTIID(id) ? encodeForURI(id) : encodeURIComponent(id)
						};
					})
						.forEach(c => this.addEntry(c));
				} else if (isMe) {
					//TODO: change this text
					this.showEmptyText('You have no public groups.');
				} else {
					this.showEmptyText('This user has no public groups.');
				}
			});
	}
});
