var Ext = require('extjs');
var UserRepository = require('../../../../../../cache/UserRepository');
var ParseUtils = require('../../../../../../util/Parsing');
var PartsUsers = require('./Users');
const { encodeForURI } = require('nti-lib-ntiids');

module.exports = exports = Ext.define('NextThought.app.profiles.group.components.membership.parts.Admins', {
	extend: 'NextThought.app.profiles.group.components.membership.parts.Users',
	alias: 'widget.profile-group-membership-administrators',

	cls: 'memberships full group admin four-column',
	title: 'Administrators',


	setUser: function (user, isMe) {
		var me = this;
		me.removeAll();
		return UserRepository.getUser(user.get('Creator'))
			.then(function (creator) {
			var creatoryConfig;
			if (creator) {
				creatorConfig = {
					member: creator,
					name: creator.getName(),
					route: encodeForURI(creator.getId())
				};
				me.addEntry(creatorConfig);
			 } else {
				me.showEmptyText('This group has no administrators.');
			 }
		});
	}
});
	
