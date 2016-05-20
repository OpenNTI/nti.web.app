const Ext = require('extjs');
const {encodeForURI, isNTIID} = require('nti-lib-ntiids');
require('./Membership');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.membership.parts.Communities', {
	extend: 'NextThought.app.profiles.user.components.membership.parts.Membership',
	alias: 'widget.profile-user-membership-communities',

	cls: 'memberships full communities four-column',
	title: 'Communities',
	profileRouteRoot: '/community',

	entryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'entry', 'data-route': '{route}', cn: [
			'{community:avatar}',
			{cls: 'name', html: '{name}'}
		]
	})),


	setUser (user, isMe) {
		this.removeAll();

		user.getCommunityMembership()
			.then(communities => {
				if (communities.length) {
					communities.map(community => {
						const id = community.getId();
						return {
							community: community,
							name: community.getName(),
							route: isNTIID(id) ? encodeForURI(id) : encodeURIComponent(id)
						};
					})
					.forEach(c => this.addEntry(c));
				} else if (isMe) {
					//TODO: change this text
					this.showEmptyText('You have no public communities');
				} else {
					this.showEmptyText('This user has no public communities');
				}
			});
	}
});
