Ext.define('NextThought.model.UserSearch', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.User',
		'NextThought.proxy.UserSearch'
	],

	mixins: { shareEntity: 'NextThought.mixins.ShareEntity' },

	statics: {
		getType: function(modelData) {
			var m = ((modelData && modelData.Class) || '').toLowerCase(), type;

			//Tweak logic slightly if our type is community or
			//our user is public or everyone make it look public
			if (/^community$/.test(m)) {
				type = 'public';
			}
			else if (/^friendslist$/.test(m)) {
				type = NextThought.mixins.ShareEntity.getPresentationType(modelData);
			}
			else {
				type = 'person';
			}

			return type;
		}
	},

	idProperty: 'Username',
	homogenous: true,
	fields: [
		{ name: 'Username', type: 'string' },
		{ name: 'Presence', convert: function(v, record) {
			var presence = Ext.getStore('PresenceInfo').getPresenceOf(record.get('Username'));
			if (presence) {
				console.log(presence, presence.toString());
			} else if ($AppConfig.debug) {
				console.log('No presence data for ' + record.getId());
			}

			return presence;
		}},
		{ name: 'affiliation', type: 'string', persist: false },
		{ name: 'role', type: 'string', persist: false },
		{ name: 'location', type: 'string', persist: false },
		{ name: 'alias', type: 'string' },
		{ name: 'status', convert: function(v, record) {
			var presence = record.get('Presence');
			return (presence && presence.getDisplayText()) || '';
		}},
		{ name: 'realname', type: 'string' },
		{ name: 'avatarURL', type: 'AvatarURL' },
		{ name: 'displayName', convert: function(v, r) {return r.getName();}},
		{ name: 'IsDynamicSharing', type: 'auto'}
	]
}, function() {
	this.borrow(NextThought.model.User, ['getName', 'getProfileUrl']);
});
