const Ext = require('extjs');
const {encodeForURI, isNTIID} = require('@nti/lib-ntiids');
require('./Membership');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.about.parts.Groups', {
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


	setUser (user, isMe) {
		this.removeAll();

		user.getGroupMembership()
			.then(groups => {
				if (groups.length) {
					if(groups.length <= this.limit) {
						this.seeAllEl.hide();
					}
					groups.slice(0, this.limit)
						.map(group => {
							const id = group.getId();
							this.addEntry({
								group: group,
								name: group.getName(),
								route: isNTIID(id) ? encodeForURI(id) : encodeURIComponent(id)
							});
						});

				//if there are no groups hide this cmp
				} else {
					this.hide();
				}
			});
	},


	getValues () {}
});
