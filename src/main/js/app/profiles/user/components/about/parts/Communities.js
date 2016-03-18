var Ext = require('extjs');
var ParseUtils = require('../../../../../../util/Parsing');
var PartsMembership = require('./Membership');


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


	setUser: function(user, isMe) {
		var me = this;

		me.removeAll();

		user.getCommunityMembership()
			.then(function(communities) {
				if (communities.length <= me.limit){
					me.seeAllEl.hide();
				}
				if (communities.length) {
					communities.slice(0, me.limit)
						.map(function(community) {
							return {
								community: community,
								name: community.getName(),
								route: ParseUtils.encodeForURI(community.getId())
							};
						})
						.forEach(me.addEntry.bind(me));
				//if there are no communities hide this cmp
				} else {
					me.hide();
				}
			});
	},


	getValues: function() {}
});
