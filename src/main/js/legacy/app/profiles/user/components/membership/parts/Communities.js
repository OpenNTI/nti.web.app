var Ext = require('extjs');
var ParseUtils = require('../../../../../../util/Parsing');
var PartsMembership = require('./Membership');
const { encodeForURI } = require('nti-lib-ntiids');


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


	setUser: function (user, isMe) {
		var me = this;

		me.removeAll();

		user.getCommunityMembership()
			.then(function (communities) {
				if (communities.length) {
					communities.map(function (community) {
						return {
							community: community,
							name: community.getName(),
							route: encodeForURI(community.getId())
						};
					})
					.forEach(me.addEntry.bind(me));
				} else if (isMe) {
					//TODO: change this text
					me.showEmptyText('You have no public communities');
				} else {
					me.showEmptyText('This user has no public communities');
				}
			});
	}
});
