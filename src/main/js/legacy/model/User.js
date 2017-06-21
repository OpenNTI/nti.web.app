const Ext = require('extjs');

const {getString} = require('legacy/util/Localization');
const B64 = require('legacy/util/Base64');
const Globals = require('legacy/util/Globals');
const ParseUtils = require('legacy/util/Parsing');
const Avatar = require('legacy/mixins/Avatar');

const Community = require('./Community');
const FriendsList = require('./FriendsList');
const PresenceInfo = require('./PresenceInfo');

require('./Base');


const User = module.exports =
exports = Ext.define('NextThought.model.User', {
	extend: 'NextThought.model.Base',
	idProperty: 'Username',

	mixins: {
		Avatar: 'NextThought.mixins.Avatar'
	},

	isProfile: true,

	fields: [
		{ name: 'lastLoginTime', type: 'date', dateFormat: 'timestamp' },
		{ name: 'NotificationCount', type: 'int' },
		{ name: 'Username', type: 'string' },
		{ name: 'OU4x4', type: 'string' },
		{ name: 'FirstName', type: 'string', mapping: 'NonI18NFirstName', convert: function (v, r) {
			// TODO: The mapping should normally take care of this conversion but it's doesn't seem to do it.
			var fname = r && r.raw && r.raw.NonI18NFirstName;
			if (Ext.isEmpty(v) && !Ext.isEmpty(fname)) {
				return fname;
			}

			return v;
		}},
		{ name: 'LastName', type: 'string', mapping: 'NonI18NLastName', convert: function (v, r) {
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
		{ name: 'backgroundURL', type: 'string'},
		{ name: 'AvatarURLChoices', type: 'AvatarURLList', persist: false },
		{ name: 'accepting', type: 'UserList' },
		{ name: 'ignoring', type: 'UserList' },
		{ name: 'status', type: 'Synthetic', persist: false, fn: function (record) {
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
		{ name: 'DynamicMemberships', type: 'ArrayItem'},
		{ name: 'displayName', type: 'Synthetic', persist: false, fn: function (r) {
			return r.getName();
		} },
		{ name: 'about', type: 'auto'},
		{ name: 'affiliation', type: 'string'},
		{ name: 'education', type: 'auto'},
		{ name: 'role', type: 'string'},
		{ name: 'location', type: 'string'},
		{ name: 'home_page', type: 'string'},
		{ name: 'admission_status', type: 'string', mapping: 'fmaep_admission_state', defaultValue: null, persist: false},

		//Social Links
		{name: 'facebook', type: 'string'},
		{name: 'twitter', type: 'string'},
		{name: 'googlePlus', type: 'string'},
		{name: 'linkedIn', type: 'string'},

		{name: 'interests', type: 'auto'},
		{name: 'education', type: 'auto'},
		{name: 'positions', type: 'auto'},

		// ui data
		{name: 'unreadMessageCount', type: 'auto', persist: false},
		{ name: 'avatarInitials', type: 'string', persist: false},
		{ name: 'avatarBGColor', type: 'string', persist: false}
	],

	isUser: true,
	summaryObject: true,

	constructor: function () {
		this.callParent(arguments);

		this.initAvatar();
	},

	equal: function (b) {
		if (Ext.isString(b) && this.getId() === b) {
			return true;
		}
		return this.callParent(arguments);
	},

	getCommunities: function (excludeDFLs) {
		var r = [], u;

		Ext.each(this.get('Communities'), function (c) {
			var field = 'Username';

			if (/^everyone$/i.test(c)) {
				return;
			}

			//DFLs come back in communities but their usernames are ntiids.
			if (ParseUtils.isNTIID(c)) {
				field = 'NTIID';
			}

			u = User.Repository.store.findRecord(field, c, 0, false, true, true);
			if (u) {
				r.push(u);
			}
			else {
				console.warn('Dropping unresolvable community: ' + Ext.encode(c));
			}

		});

		if (excludeDFLs) {
			return Ext.Array.filter(r, function (i) { return i.isCommunity; });
		}
		return r;
	},

	getData: function () {
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

	toString: function () {
		return this.getName();
	},

	shouldBeRoot: function () {
		return true;
	},

	getTitle: function () {
		return this.getName();
	},

	getName: function () {
		return this.get('alias') ||
			this.get('realname') ||

			User.getUsername(this.get('Username'));
	},

	getURLPart: function () {
		var id = this.get('Username');

		if ($AppConfig.obscureUsernames) {
			id = B64.encodeURLFriendly(id);
		}

		return encodeURIComponent(id);
	},

	getProfileUrl: function (tab) {
		if (!this.getLink('Activity')) {
			return null;
		}

		var id = this.get('Username');

		if ($AppConfig.obscureUsernames) {
			id = B64.encodeURLFriendly(id);
		}

		return tab ? '/user/' + id + '/' + Globals.trimRoute(tab) + '/' : '/user/' + id;
	},

	getPresence: function () {
		var presence = this.get('Presence');
		return presence || PresenceInfo.createFromPresenceString('Offline');
	},

	hasBlog: function () {
		return Boolean(this.getLink('Blog'));
	},

	getAvatarInitials: function () {
		if (this.isUnresolved()) {
			return null;
		}
		return Avatar.getAvatarInitials(this.raw, this.get('FirstName'), this.get('LastName'), this.getName());
	},

	save: function (ops) {
		var data = this.asJSON();

		//The avatar is saved in another place; don't try to do it here. Also custom avatar urls will cause a 422
		delete data.avatarURL;

		Ext.Ajax.request(Ext.apply({
			url: this.getLink('edit'),
			method: 'PUT',
			jsonData: data
		}, ops));
	},

	isUnresolved: function () {
		return this.Unresolved === true;
	},

	getSchema: function () {
		if (this.loadSchema) {
			return this.loadSchema;
		}

		var link = this.getLink('account.profile');

		if (link) {
			this.loadSchema = Service.request(link)
				.then(function (response) {
					return JSON.parse(response);
				});
		} else {
			this.loadSchema = Promise.reject({});
		}

		return this.loadSchema;
	},

	getAboutData: function () {
		return {
			'displayName': this.getName(),
			'realname': this.get('realname'),
			'about': this.get('about'),
			'email': this.get('email'),
			'home_page': this.get('home_page'),
			'location': this.get('location'),
			'education': this.get('education') || [],
			'positions': this.get('positions') || [],
			'interests': this.get('interests') || [],
			'facebook': this.get('facebook'),
			'twitter': this.get('twitter'),
			'googlePlus': this.get('googlePlus'),
			'linkedIn': this.get('linkedIn')
		};
	},

	getMemberships: function (force) {
		if (this.loadMemberships && !force) {
			return this.loadMemberships;
		}

		var link = this.getLink('memberships');

		if (link) {
			this.loadMemberships = Service.request(link)
				.then(function (response) {
					var json = JSON.parse(response);

					return ParseUtils.parseItems(json);
				});
		} else {
			this.loadMemberships = Promise.reject();
		}

		return this.loadMemberships;
	},

	__filterMemberships: function (fn) {
		return this.getMemberships()
			.then(function (memberships) {
				return memberships.filter(fn);
			});
	},

	getCommunityMembership: function () {
		return this.__filterMemberships(function (membership) {
			return membership instanceof Community;
		});
	},

	getGroupMembership: function () {
		return this.__filterMemberships(function (membership) {
			return membership instanceof FriendsList;
		});
	},

	statics: {

		BLANK_AVATAR: '/app/resources/images/icons/unresolved-user.png',


		getUnresolved: function (username) {
			username = username || 'Unknown';
			var maybeObfuscate = username !== 'Unknown',
				alias = maybeObfuscate ? this.getUsername(username) : username,
				u = new User({
					Username: username,
					alias: alias,
					avatarURL: this.BLANK_AVATAR,
					affiliation: 'Unknown',
					status: '',
					Presence: PresenceInfo.createFromPresenceString('Offline')
				}, username);
			u.Unresolved = true;
			return u;
		},


		getUsername: function (usernameSeed) {
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

		getUsernameForURL: function (username) {
			if ($AppConfig.obscureUsernames) {
				username = B64.encodeURLFriendly(username);
			}

			return encodeURIComponent(username);
		},

		getProfileStateFromFragment: function (fragment) {
			var re = /^#!profile\/([^\/]+)\/?(.*)$/i, o = re.exec(fragment);

			function filter (u) {
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

		getIdFromRaw: function (raw) {
			return raw.getId ? raw.getId() : raw.Username;
		},


		getIdFromURIPart: function (part) {
			part = decodeURIComponent(part);

			if ($AppConfig.obscureUsernames) {
				return B64.decodeURLFriendly(part) || part;
			}

			return part;
		}

	},

	hasVisibilityField: function (field) {
		return Boolean(this.raw && this.raw[field]);
	},

	refresh: function () {
		var req = {
			url: Globals.getURL(this.get('href')),
			callback: function (q, s, r) {
				if (!s) {
					console.warn('could not refresh user');
					return;
				}

				var u = ParseUtils.parseItems(r.responseText);
				User.Repository.precacheUser(u.first());
			}
		};

		Ext.Ajax.request(req);
	},

	getActivityItemConfig: function (type) {
		return Promise.resolve({
			name: this.getName(),
			verb: ((/circled/i).test(type) ? ' added you as a contact.' : '?')
		});
	},

	sendEmailVerification: function () {
		if (!this.hasLink('RequestEmailVerification')) {
			return Promise.reject();
		}

		var reqLink = this.getLink('RequestEmailVerification');
		return Service.post(reqLink)
			.then(function () {
				return Promise.resolve();
			});
	},

	isEmailVerified: function () {
		return !this.hasLink('RequestEmailVerification');
	},

	verifyEmailToken: function (token) {
		if (!this.hasLink('VerifyEmailWithToken') || !token) {
			return Promise.reject();
		}

		var link = this.getLink('VerifyEmailWithToken'), me = this;
		return Service.post(link, {token: token})
			.then(function (response) {
				me.deleteLink('RequestEmailVerification');
				return Promise.resolve(response);
			});
	},

	getSuggestContacts: function () {
		if (!Globals.isFeature('suggest-contacts') || !(this.hasLink('SuggestContacts') || this.hasLink('Classmates'))) { return Promise.reject(); }

		var link = this.getLink('SuggestContacts') || this.getLink('Classmates');

		return Service.request(link)
			.then(function (response) {
				var parent = JSON.parse(response);
				return ParseUtils.parseItems(parent.Items);
			});
	},

	removeFirstTimeLoginLink: function () {
		var rel = 'first_time_logon',
			link = this.getLink(rel), me = this;
		if (!link) { return Promise.reject(); }

		return Service.requestDelete(link)
			.then(function () {
				me.deleteLink(rel);
				return Promise.resolve();
			});
	}
}, function () {
	window.User = this;
});
