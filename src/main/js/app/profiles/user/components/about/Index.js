export default Ext.define('NextThought.app.profiles.user.components.about.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-user-about',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	requires: [
		'NextThought.app.profiles.user.components.about.parts.Empty',
		'NextThought.app.profiles.user.components.about.parts.About',
		'NextThought.app.profiles.user.components.about.parts.Communities',
		'NextThought.app.profiles.user.components.about.parts.Education',
		'NextThought.app.profiles.user.components.about.parts.Groups',
		'NextThought.app.profiles.user.components.about.parts.Positions',
		'NextThought.app.profiles.user.components.about.parts.Interests',
		'NextThought.app.profiles.components.SuggestedContacts'
	],


	layout: 'none',
	cls: 'profile-about user-about',

	items: [
		{
			xtype: 'container',
			layout: 'none',
			cls: 'left',
			items: [
				{xtype: 'profile-user-empty'},
				{xtype: 'profile-user-about-about'},
				{xtype: 'profile-user-about-education'},
				{xtype: 'profile-user-about-positions'},
				{xtype: 'profile-user-about-interests'}
			]
		},
		{
			xtype: 'container',
			layout: 'none',
			cls: 'right',
			items: [
				{xtype: 'profile-suggested-contacts'},
				{xtype: 'profile-user-about-communities'},
				{xtype: 'profile-user-about-groups'}
			]
		}
	],


	initComponent: function() {
		this.callParent(arguments);

		var me = this;

		me.initRouter();

		me.addRoute('/', me.showAbout.bind(me));
		me.addRoute('/edit', me.showEdit.bind(me));

		me.addDefaultRoute('/');

		me.emptyCmp = me.down('profile-user-empty');
		me.aboutCmp = me.down('profile-user-about-about');
		me.educationCmp = me.down('profile-user-about-education');
		me.positionsCmp = me.down('profile-user-about-positions');
		me.interestsCmp = me.down('profile-user-about-interests');
		me.communitiesCmp = me.down('profile-user-about-communities');
		me.groupsCmp = me.down('profile-user-about-groups');
		me.suggestedCmp = me.down('profile-suggested-contacts');

		me.profileParts = [
			me.aboutCmp,
			me.educationCmp,
			me.positionsCmp,
			me.interestsCmp,
			me.communitiesCmp,
			me.groupsCmp,
			me.suggestedCmp
		];

		me.on({
			'clear-errors': me.clearError.bind(me),
			'activate': me.startResourceViewed.bind(me),
			'deactivate': me.stopResourceViewed.bind(me)
		});

		me.on('clear-errors', me.clearError.bind(me));

		me.profileParts.forEach(function(part) {
			part.doEdit = me.doEdit.bind(me);
		});
	},


	startResourceViewed: function() {
		var id = this.activeUser && this.activeUser.getId();

		if (id && !this.hasCurrentTimer) {
			AnalyticsUtil.getResourceTimer(id, {
				type: 'profile-about-viewed',
				ProfileEntity: id
			});

			this.hasCurrentTimer = true;
		}
	},


	stopResourceViewed: function() {
		var id = this.activeUser && this.activeUser.getId();

		if (id && this.hasCurrentTimer) {
			AnalyticsUtil.stopResourceTimer(id, 'profile-about-viewed');
			delete this.hasCurrentTimer;
		}
	},


	onAddedToParentRouter: function() {
		var me = this;

		this.communitiesCmp.gotoSeeAll = this.groupsCmp.gotoSeeAll = function() {
			me.gotoMembership();
		};
	},


	doEdit: function() {
		this.pushRoute('Edit', '/edit');
	},


	isDataEmpty: function(user) {
		var data = user.getAboutData(),
			empty = true;

		if (data.about || data.interests.length || data.education.length || data.positions.length) {
			empty = false;
		}

		return empty;
	},


	setEmpty: function(user) {
		this.emptyCmp.show();

		this.profileParts.forEach(function(part) {
			part.hide();
		});

		this.communitiesCmp.show();
		this.groupsCmp.show();
		this.suggestedCmp.show();
	},


	removeEmpty: function() {
		this.emptyCmp.hide();

		this.profileParts.forEach(function(part) {
			part.show();
		});
	},


	userChanged: function(user, isMe) {
		var cmps = this.profileParts;

		if (this.activeUser !== user) {
			this.stopResourceViewed();
		}

		this.activeUser = user;
		this.isMe = isMe;

		this.startResourceViewed();

		if (this.isDataEmpty(user) && !isMe) {
			this.setEmpty(user);

			this.communitiesCmp.setUser(user, isMe);
			this.groupsCmp.setUser(user, isMe);
			this.suggestedCmp.setUser(user, isMe);

			return Promise.resolve();
		}

		this.removeEmpty();

		user.getMemberships(true);

		cmps = cmps.map(function(cmp) {
			return cmp.setUser(user, isMe);
		});

		return Promise.all(cmps);
	},


	validate: function() {
		var msgs = [];

		this.profileParts.forEach(function(part) {
			var msg = part.getErrorMsg && part.getErrorMsg();

			if (msg) {
				msgs.push({
					name: part.name,
					msg: msg
				});
			}
		});

		msgs.forEach(this.showError.bind(this));

		return !msgs.length;
	},


	removeErrors: function() {
		var error = this.down('[errorName=this]');

		if (error) {
			this.remove(error);
		}

		this.profileParts.forEach(function(part) {
			if (part.clearAllErrors) {
				part.clearAllErrors();
			}
		});
	},


	clearError: function(name) {
		var error = this.down('[errorName="' + name + '"]');

		if (error) {
			this.remove(error, true);
		}
	},


	showError: function(error) {
		if (!this.down('[errorName="' + error.name + '"]')) {
			this.insert(0, {
				xtype: 'box',
				errorName: error.name,
				autoEl: {cls: 'error-message', html: error.msg}
			});
		}
	},


	getValues: function() {
		var values = this.aboutCmp.getValues();

		values.education = this.educationCmp.getValues();
		values.positions = this.positionsCmp.getValues();
		values.interests = Ext.Array.filter(this.interestsCmp.getValues() || [], function(i) { return !Ext.isEmpty(i); });

		return values;
	},


	saveEdits: function() {
		var me = this,
			user = me.activeUser,
			hasChanged = false,
			newValues = me.getValues(),
			fields = Object.keys(newValues),
			oldValues = {};

		fields.forEach(function(field) {
			oldValues[field] = user.get(field);

			//force falsy values to be null
			if (!newValues[field]) {
				newValues[field] = null;
			}

			if (oldValues[field] !== newValues[field]) {
				hasChanged = true;
			}
		});

		if (!hasChanged) {
			return Promise.resolve(true);
		}

		return new Promise(function(fulfill, reject) {
			user.set(newValues);
			user.save({
				success: function(resp) {
					var o = resp.responseText,
						newUser = ParseUtils.parseItems(o)[0];

					me.successfulEdit = true;

					me.removeErrors();

					//NOTE: Update the links that way in case the email changed, we request verification.
					user.set('Links', newUser.get('Links'));
					fulfill(true);
				},
				failure: function(resp) {
					var msg = Ext.JSON.decode(resp.responseText, true) || {};

					if (me.aboutCmp.showError(msg)) {
						me.showError({
							name: me.aboutCmp.name,
							msg: msg.message
						});
					} else if (me.educationCmp.showError(msg)) {
						me.showError({
							name: me.educationCmp.name,
							msg: msg.message
						});
					} else if (me.positionsCmp.showError(msg)) {
						me.showError({
							name: me.positionsCmp.name,
							msg: msg.message
						});
					} else if (me.interestsCmp.showError(msg)) {
						me.showError({
							name: me.interestsCmp.name,
							msg: msg.message
						});
					} else {
						me.showError({
							name: 'this',
							msg: 'There was an error saving your profile.'
						});
					}

					//if we fail reset the old values
					user.set(oldValues);

					reject(false);
				}
			});
		});
	},


	saveProfile: function() {
		var me = this;

		if (!this.validate()) {
			return Promise.resolve(false);
		}

		return me.saveEdits()
			.then(function() {
				me.pushRoute('About', '/');
			});
	},


	cancelEdit: function() {
		this.pushRoute('About', '/');
	},


	setSchema: function(schema) {
		this.profileParts.forEach(function(part) {
			if (part.setSchema) {
				part.setSchema(schema);
			}
		});
	},


	setHeaderCmp: function(header) {
		this.headerCmp = header;
	},


	allowNavigation: function() {
		if (!this.hasCls('editing') || this.successfulEdit) {
			return true;
		}

		return new Promise(function(fulfill, reject) {
			Ext.Msg.show({
				title: 'Attention!',
				msg: 'You are currently editing your profile. Would you like to leave without saving?',
				buttons: {
					primary: {
						text: 'Leave',
						cls: 'caution',
						handler: fulfill
					},
					secondary: {
						text: 'Stay',
						handler: reject
					}
				}
			});
		});
	},


	showAbout: function() {
		this.setTitle('About');
		this.removeErrors();
		delete this.successfulEdit;

		this.profileParts.forEach(function(part) {
			if (part.setUneditable) {
				part.setUneditable();
			}
		});

		this.removeCls('editing');
	},


	showEdit: function() {
		this.setTitle('About');

		delete this.successfulEdit;

		if (!this.isMe) {
			this.replaceRoute('', '/');
			return;
		}

		this.headerCmp.showEditingActions(this.saveProfile.bind(this), this.cancelEdit.bind(this));

		this.profileParts.forEach(function(part) {
			if (part.setEditable) {
				part.setEditable();
			}
		});

		this.addCls('editing');
	}
});
