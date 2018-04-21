const Ext = require('@nti/extjs');
const {encodeForURI, isNTIID} = require('@nti/lib-ntiids');

const UserRepository = require('legacy/cache/UserRepository');

require('./Users');

module.exports = exports = Ext.define('NextThought.app.profiles.group.components.membership.parts.Admins', {
	extend: 'NextThought.app.profiles.group.components.membership.parts.Users',
	alias: 'widget.profile-group-membership-administrators',

	cls: 'memberships full group admin four-column',
	title: 'Administrators',


	setUser (user, isMe) {
		this.removeAll();
		return UserRepository.getUser(user.get('Creator'))
			.then(creator => {

				if (creator) {
					let id = creator.getId();
					this.addEntry({
						member: creator,
						name: creator.getName(),
						route: isNTIID(id) ? encodeForURI(id) : encodeURIComponent(id)
					});
				} else {
					this.showEmptyText('This group has no administrators.');
				}

			});
	}
});
