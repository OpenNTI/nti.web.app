/*globals B64*/
Ext.define('NextThought.model.User', {
	extend: 'NextThought.model.Base',
	requires: ['NextThought.model.converters.PresenceInfo'],
	idProperty: 'Username',

	fields: [
		{ name: 'lastLoginTime', type: 'date', dateFormat: 'timestamp' },
		{ name: 'NotificationCount', type: 'int' },
		{ name: 'Username', type: 'string' },
		{ name: 'OU4x4', type: 'string' },
		{ name: 'FirstName', type: 'string', mapping: 'NonI18NFirstName', convert: function(v, r) {
			// TODO: The mapping should normally take care of this conversion but it's doesn't seem to do it.
			var fname = r && r.raw && r.raw.NonI18NFirstName;
			if (Ext.isEmpty(v) && !Ext.isEmpty(fname)) {
				return fname;
			}

			return v;
		}},
		{ name: 'LastName', type: 'string', mapping: 'NonI18NLastName', convert: function(v, r) {
			var lname = r && r.raw && r.raw.NonI18NLastName;
			if (Ext.isEmpty(v) && !Ext.isEmpty(lname)) {
				return lname;
			}

			return v;
		}},

		{ name: 'Presence', type: 'PresenceInfo', persist: false },
		{ name: 'alias', type: 'string' },
		{ name: 'email', type: 'string' },
		{ name: 'realname', type: 'string' },
		{ name: 'avatarURL', type: 'AvatarURL' },
		{ name: 'AvatarURLChoices', type: 'AvatarURLList', persist: false },
		{ name: 'accepting', type: 'UserList' },
		{ name: 'ignoring', type: 'UserList' },
		{ name: 'status', type: 'Synthetic', persist: false, fn: function(record) {
			//The presence isn't always a PresenceInfo in testing
			try {
				var p = record.get('Presence');
				return (p && p.getDisplayText && p.getDisplayText()) || null;
			} catch (e) {
				console.warn(e.stack || e.message || e);
			}
			return null;
		}},
		{ name: 'opt_in_email_communication', type: 'boolean' },
		{ name: 'following', type: 'UserList' },
		{ name: 'Communities', type: 'UserList' },
		{ name: 'displayName', type: 'Synthetic', persist: false, fn: function(r) {
			return r.getName();
		} },
		{ name: 'about', type: 'string'},
		{ name: 'affiliation', type: 'string'},
		{ name: 'role', type: 'string'},
		{ name: 'location', type: 'string'},
		{ name: 'home_page', type: 'string'},
		{ name: 'admission_status', type: 'string', mapping: 'fmaep_admission_state', defaultValue: null, persist: false}
	],

	isUser: true,
	summaryObject: true,


	equal: function(b) {
		if (Ext.isString(b) && this.getId() === b) {
			return true;
		}
		return this.callParent(arguments);
	},


	getCommunities: function(excludeDFLs) {
		var r = [], u;

		Ext.each(this.get('Communities'), function(c) {
			var field = 'Username';

			if (/^everyone$/i.test(c)) {
				return;
			}

			//DFLs come back in communities but their usernames are ntiids.
			if (ParseUtils.isNTIID(c)) {
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

		if (excludeDFLs) {
			return Ext.Array.filter(r, function(i) { return i.isCommunity; });
		}
		return r;
	},


	getData: function() {
		var k, v, f = this.callParent(arguments);

		for (k in f) {
			if (f.hasOwnProperty(k)) {
				v = f[k];
				if (v && v.isModel) {
					f[k] = v.isUser ? v.getId() : v.getData.apply(v, arguments);
				}
			}
		}

		return f;
	},


	toString: function() {
		return this.getName();
	},


	getName: function() {
		return this.get('alias') ||
			   this.get('realname') ||
			   //because this implementation is 'borrowed', we cannot assume 'this'
			   // is anything more than A model. Not necessarily "this" model.
			   NextThought.model.User.getUsername(this.get('Username'));
	},


	getProfileUrl: function(subPage) {
		var id = this.get('Username'),
			subPages = subPage || [];


		if ($AppConfig.obscureUsernames) {
			id = B64.encodeURLFriendly(id);
		}

		if (!Ext.isArray(subPages) && arguments.length > 0) {
			subPages = Ext.Array.clone(arguments);
		}
		subPages = Ext.isEmpty(subPages, false) ? '' : '/' + Ext.Array.map(subPages, encodeURIComponent).join('/');
		return ['#!profile/', encodeURIComponent(id), subPages].join('');
	},


	getPresence: function() {
		var presence = this.get('Presence');
		return presence || NextThought.model.PresenceInfo.createFromPresenceString('Offline');
	},


	hasBlog: function() {
		return Boolean(this.getLink('Blog'));
	},


	save: function(ops) {
		var data = this.asJSON();

		//The avatar is saved in another place; don't try to do it here. Also custom avatar urls will cause a 422
		delete data.avatarURL;

		Ext.Ajax.request(Ext.apply({
		   url: this.getLink('edit'),
		   method: 'PUT',
		   jsonData: data
	   }, ops));
	},


	isUnresolved: function() {
		return this.Unresolved === true;
	},


	statics: {

		BLANK_AVATAR: 'resources/images/icons/unresolved-user.png',

		getUnresolved: function(username) {
			username = username || 'Unknown';
			var maybeObfuscate = username !== 'Unknown',
				alias = maybeObfuscate ? this.getUsername(username) : username,
				u = new NextThought.model.User({
			   Username: username,
			   alias: alias,
			   avatarURL: this.BLANK_AVATAR,
			   affiliation: 'Unknown',
			   status: '',
			   Presence: NextThought.model.PresenceInfo.createFromPresenceString('Offline')
		   }, username);
			u.Unresolved = true;
			return u;
		},


		getUsername: function(usernameSeed) {
			var sitePattern = getString('UnresolvedUsernamePattern', 'username'),
				// negagitive numbers dont look good. So just Abs() them.  Since we're not
				// using this other than to display, shouldn't be a problem.
				hash = (usernameSeed && Math.abs(usernameSeed.hash())) || -1,
				hashPlaceholder = (/(#+)/g);

			if (/^username$/i.test(sitePattern)) {
				return usernameSeed;
			}

			return sitePattern.replace(hashPlaceholder, hash);
		},


		getProfileStateFromFragment: function(fragment) {
			var re = /^#!profile\/([^\/]+)\/?(.*)$/i, o = re.exec(fragment);

			function filter(u) {
				if ($AppConfig.obscureUsernames) {
					return B64.decodeURLFriendly(u) || u;
				}
				return u;
			}

			return o ? {
				username: filter(decodeURIComponent(o[1])),
				activeTab: o[2]
			} : null;
		},

		getIdFromRaw: function(raw) {
			return raw.getId ? raw.getId() : raw.Username;
		}

	},


	hasVisibilityField: function(field) {
		return Boolean(this.raw && this.raw[field]);
	},


	refresh: function() {
		var req = {
			url: getURL(this.get('href')),
			callback: function(q, s, r) {
				if (!s) {
					console.warn('could not refresh user');
					return;
				}

				var u = ParseUtils.parseItems(r.responseText);
				UserRepository.precacheUser(u.first());
			}
		};

		Ext.Ajax.request(req);
	},


	getActivityItemConfig: function(type) {
		return Promise.resolve({
			name: this.getName(),
			verb: ((/circled/i).test(type) ? ' added you as a contact.' : '?')
		});
	},


	sendEmailVerification: function() {
		if (!this.hasLink('RequestEmailVerification')) {
			return Promise.reject();
		}

		var reqLink = this.getLink('RequestEmailVerification');
		return Service.post(reqLink)
			.then(function(response) {
				return Promise.resolve();
			});
	},


	verifyEmailToken: function(token) {
		if (!this.hasLink('VerifyEmailWithToken') || !token) {
			return Promise.reject();
		}

		var link = this.getLink('VerifyEmailWithToken');
		return Service.post(link, {token: token})
			.then(function(response) {
				return Promise.resolve(response);
			});
	},


	getSuggestContacts: function() {
		if (!isFeature('suggest-contacts') || !(this.hasLink('SuggestContacts') || this.hasLink('Classmates'))) { return Promise.reject(); }

		var link = this.getLink('SuggestContacts') || this.getLink('Classmates');

		return Service.request(link)
			.then(function(response) {
				var parent = JSON.parse(response);
				return ParseUtils.parseItems(parent.Items);
			});
	},


	removeFirstTimeLoginLink: function() {
		var rel = 'first_time_logon',
			link = this.getLink(rel), me = this;
		if (!link) { return Promise.reject(); }

		return Service.requestDelete(link)
			.then(function(response) {
				me.deleteLink(rel);
				return Promise.resolve();
			});
	}

}, function() {
	window.User = this;
});
