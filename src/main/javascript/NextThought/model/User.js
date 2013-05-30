Ext.define('NextThought.model.User', {
	extend: 'NextThought.model.Base',
	requires: ['NextThought.model.converters.PresenceInfo'],
	idProperty: 'Username',
	resolveUsers: true,
	fields: [
		{ name: 'lastLoginTime', type: 'date', dateFormat: 'timestamp' },
		{ name: 'NotificationCount', type: 'int' },
		{ name: 'Username', type: 'string' },
		{ name: 'Presence', type: 'PresenceInfo', persist: false },
		{ name: 'alias', type: 'string' },
		{ name: 'email', type: 'string' },
		{ name: 'realname', type: 'string' },
		{ name: 'avatarURL', type: 'AvatarURL' },
		{ name: 'AvatarURLChoices', type: 'AvatarURLList' },
		{ name: 'accepting', type: 'UserList' },
		{ name: 'ignoring', type: 'UserList' },
		{ name: 'status', type: 'Synthetic', fn: function(record){
			console.log('called');
			return record.get('Presence').getDisplayText();
		}},
		{ name: 'opt_in_email_communication', type: 'boolean' },
		{ name: 'following', type: 'UserList' },
		{ name: 'Communities', type: 'UserList' },
		{ name: 'displayName', convert: function (v, r) {
			return r.getName();
		}},
		{ name: 'affiliation', type: 'string'},
		{ name: 'role', type: 'string'},
		{ name: 'location', type: 'string'},
		{ name: 'home_page', type: 'string'}
	],

	summaryObject: true,

	getCommunities: function (excludeDFLs) {
		var r = [], u;

		Ext.each(this.get('Communities'), function (c) {
			var field = 'Username';

			if (/^everyone$/i.test(c)) {
				return;
			}

			//DFLs come back in communities but there usernames are ntiids.
			if (ParseUtils.parseNtiid(c)) {
				field = 'NTIID';
			}

			u = UserRepository.store.findRecord(field, c, 0, false, true, true);
			if (u) {
				r.push(u);
			}
			else {
				console.warn('Dropping unresolvable community: ' + Ext.encode(c));
			}

		});

		if(excludeDFLs){
			return Ext.Array.filter(r, function(i){ return i.isCommunity; });
		}
		return r;
	},


	toString: function () {
		return this.getName();
	},


	getName: function () {
		return this.get('alias') || this.get('realname') || this.get('Username');
	},


	getProfileUrl: function (subPage) {
		var u = encodeURIComponent(this.get('Username')),
			subPages = subPage || [];

		if (!Ext.isArray(subPages) && arguments.length > 0) {
			subPages = Ext.Array.clone(arguments);
		}
		subPages = Ext.isEmpty(subPages, false) ? '' : '/' + Ext.Array.map(subPages, encodeURIComponent).join('/');
		return ['#!profile/', u, subPages].join('');
	},

	getPresence: function(){
		var presence = this.get('Presence');

		return (presence)? presence :  NextThought.model.PresenceInfo.createFromPresenceString('Offline');
	},

	hasBlog: function () {
		return Boolean(this.getLink('Blog'));
	},


	save: function (ops) {
		Ext.Ajax.request(Ext.apply({
			url: this.getLink('edit'),
			method: 'PUT',
			jsonData: this.getData()
		}, ops));
	},

	isUnresolved: function () {
		return this.Unresolved === true;
	},


	statics: {

		getUnresolved: function (username) {
			var u = new NextThought.model.User({
				Username: username,
				avatarURL: 'resources/images/icons/unresolved-user.png',
				affiliation: 'Unknown',
				status: '',
				Presence: NextThought.model.PresenceInfo.createFromPresenceString("Offline")
			}, username);
			u.Unresolved = true;
			return u;
		},


		getProfileStateFromFragment: function (fragment) {
			var re = /^#!profile\/([^\/]+)\/?(.*)$/i, o = re.exec(fragment);
			return o ? {
				username: decodeURIComponent(o[1]),
				activeTab: o[2]
			} : null;
		}

	}

}, function () {
	window.User = this;
});
