const Ext = require('@nti/extjs');
const { encodeForURI, isNTIID } = require('@nti/lib-ntiids');
require('./Membership');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.about.parts.Communities', {
	extend: 'NextThought.app.profiles.user.components.about.parts.Membership',
	alias: 'widget.profile-user-about-communities',

	cls: 'memberships preview communities',
	title: 'Communities',

	profileRouteRoot: '/community',

	limit: 4,

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
				if (communities.length <= this.limit) {
					this.seeAllEl.hide();
				}
				if (communities.length) {
					communities.slice(0, this.limit)
						.map(community => {
							const id = community.getId();
							this.addEntry({
								community: community,
								name: community.getName(),
								route: isNTIID(id) ? encodeForURI(id) : encodeURIComponent(id)
							});
						});

				//if there are no communities hide this cmp
				} else {
					this.hide();
				}
			});
	},


	getValues () {}
});
