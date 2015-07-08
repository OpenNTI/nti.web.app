Ext.define('NextThought.app.profiles.user.components.about.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-user-about',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	requires: [
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

		this.initRouter();

		this.addRoute('/', this.showAbout.bind(this));
		this.addRoute('/edit', this.showEdit.bind(this));

		this.addDefaultRoute('/');

		this.aboutCmp = this.down('profile-user-about-about');
		this.educationCmp = this.down('profile-user-about-education');
		this.positionsCmp = this.down('profile-user-about-positions');
		this.interestsCmp = this.down('profile-user-about-interests');
		this.communitiesCmp = this.down('profile-user-about-communities');
		this.groupsCmp = this.down('profile-user-about-groups');
		this.suggestedCmp = this.down('profile-suggested-contacts');

		this.profileParts = [
			this.aboutCmp,
			this.educationCmp,
			this.positionsCmp,
			this.interestsCmp,
			this.communitiesCmp,
			this.groupsCmp,
			this.suggestedCmp
		];

		this.on('clear-errors', this.clearError.bind(this));
	},


	onAddedToParentRouter: function() {
		var me = this;

		this.communitiesCmp.gotoSeeAll = this.groupsCmp.gotoSeeAll = function() {
			me.gotoMembership();
		};
	},


	userChanged: function(user, isMe) {
		var cmps = this.profileParts;

		this.activeUser = user;
		this.isMe = isMe;

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
		values.interests = Ext.Array.filter(this.interestsCmp.getValues()||[], function(i){return !Ext.isEmpty(i);});

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
