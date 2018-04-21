const Ext = require('@nti/extjs');

const ChatActions = require('legacy/app/chat/Actions');
const ChatStateStore = require('legacy/app/chat/StateStore');
const SettingsWindow = require('legacy/app/account/settings/Window');

// const EmailverifyWindow = require('./emailverify/Window');

require('legacy/model/User');
require('../../components/Header');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.Header', {
	extend: 'NextThought.app.profiles.components.Header',
	alias: 'widget.profile-user-header',
	cls: 'profile-header user-header',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'buttons'},
		{cls: 'outline', cn: [
			{cls: 'avatar-container'},
			{cls: 'meta', cn: [
				{cls: 'about', cn: [
					{cls: 'field-container', cn: [
						{cls: 'field username', 'data-field': 'alias'}
					]},
					{cls: 'field education', 'data-field': 'education'},
					{cls: 'field position', 'data-field': 'position'},
					{cls: 'field location', 'data-field': 'location'},
					{tag: 'a', target: '_blank', cls: ' field homepage', 'data-field': 'home_page'}
				]},
				{cls: 'social-fields', cn: [
					{tag: 'a', target: '_blank', cls: 'social facebook'},
					{tag: 'a', target: '_blank', cls: 'social linked-in'},
					{tag: 'a', target: '_blank', cls: 'social twitter'},
					{tag: 'a', target: '_blank', cls: 'social google-plus'}
				]}
			]},
			{cls: 'tabs'}
		]}
	]),

	renderSelectors: {
		avatarContainerEl: '.avatar-container',
		usernameEl: '.about .username',
		educationEl: '.about .education',
		positionEl: '.about .position',
		locationEl: '.about .location',
		homepageEl: '.about .homepage',
		facebookEl: '.social.facebook',
		linkedInEl: '.social.linked-in',
		twitterEl: '.social.twitter',
		googleEl: '.social.google-plus',
		tabsEl: '.tabs',
		buttonsEl: '.buttons'
	},

	initComponent: function () {
		this.callParent(arguments);

		this.ChatStore = ChatStateStore.getInstance();
		this.ChatActions = ChatActions.create();

		this.mon(this.ChatStore, 'presence-changed', this.onPresenceChanged.bind(this));
	},

	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.avatarContainerEl, 'click', this.maybeEditAvatar.bind(this));
	},

	updateUser: function (user, tabs, contact, isMe) {
		if (!this.rendered) {
			this.on('afterrender', this.updateUser.bind(this, user, tabs, contact));
			return;
		}

		this.user = user;
		this.isContact = contact;
		Ext.destroy(this.userMonitor);

		this.userMonitor = this.mon(user, {
			destroyable: true,
			'changed': this.fillInUser.bind(this, user)
		});

		this.fillInUser(user);

		this.__updateTabs(tabs);
		this.clearButtons();

		this.avatarContainerEl.removeCls('editing');

		if (isMe) {
			this.isMe = true;
			this.__showMyButtons();
		} else if (contact) {
			this.isContact = true;
			this.__showContactButtons();
		} else {
			this.__showNonContactButtons();
		}
	},

	fillInUser: function (user) {
		var data = user.getAboutData(),
			presence = user.getPresence();

		this.avatarContainerEl.dom.innerHTML = Ext.util.Format.avatar(user);
		this.usernameEl.update(data.displayName);

		this.__updateAbout(data);
		this.__updateSocial(data);

		this.__updatePresence(presence);
	},

	setSchema: function (schema) {},

	__updateAbout: function (data) {
		var education = data.education[0],
			educationString,
			position = data.positions[0],
			positionString;

		if (education) {
			if (education.degree) {
				educationString = education.degree + ' at ' + education.school;
			} else {
				educationString = education.school;
			}
		}

		if (position) {
			if (position.title) {
				positionString = position.title + ' at ' + position.companyName;
			} else {
				positionString = position.companyName;
			}
		}

		if (educationString) {
			this.educationEl.removeCls('hidden');
			this.educationEl.update(educationString);
		} else {
			this.educationEl.addCls('hidden');
		}

		if (positionString) {
			this.positionEl.removeCls('hidden');
			this.positionEl.update(positionString);
		} else {
			this.positionEl.addCls('hidden');
		}

		if (data.location) {
			this.locationEl.removeCls('hidden');
			this.locationEl.update(data.location);
		} else {
			this.locationEl.addCls('hidden');
		}

		if (data.home_page) {
			this.homepageEl.removeCls('hidden');
			this.homepageEl.update(data.home_page);
			this.homepageEl.dom.setAttribute('href', data.home_page);
		} else {
			this.homepageEl.addCls('hidden');
			this.homepageEl.dom.setAttribute('href', 'about:blank');
		}
	},

	__updateSocial: function (data) {
		var me = this,
			links = [
				{
					field: 'facebook',
					el: 'facebookEl'
				},
				{
					field: 'twitter',
					el: 'twitterEl'
				},
				{
					field: 'linkedIn',
					el: 'linkedInEl'
				},
				{
					field: 'googlePlus',
					el: 'googleEl'
				}
			];

		links.forEach(function (link) {
			var href = data[link.field],
				el = me[link.el];

			if (href) {
				el.removeCls('hidden');
				el.dom.setAttribute('href', href);
			} else {
				el.addCls('hidden');
				el.dom.setAttribute('href', 'about:blank');
			}
		});
	},

	__updatePresence: function (presence) {
		this.usernameEl.removeCls(this.currentPresence && this.currentPresence.getName());
		this.currentPresence = presence;
		this.usernameEl.addCls(this.currentPresence.getName());

		if (this.isContact) {
			this.__showContactButtons();
		}
	},

	__updateTabs: function (tabs) {
		this.clearTabs();

		tabs.forEach(this.addTab.bind(this));
	},

	__showMyButtons: function () {
		this.clearButtons();

		this.addButton({
			cls: 'edit',
			action: 'onEditProfile',
			label: 'Edit Profile'
		});
	},

	showEditingActions: function (save, cancel) {
		this.clearButtons();

		this.editSaveAction = save,
		this.editCancelAction = cancel;

		this.avatarContainerEl.addCls('editing');

		this.addButton({
			cls: 'save',
			action: 'onEditSave',
			label: 'Save'
		});

		this.addButton({
			cls: 'cancel',
			action: 'onEditCancel',
			label: 'Cancel'
		});
	},

	onEditProfile: function () {
		this.pushRoute('Edit', '/about/edit');
	},

	onEditSave: function () {
		if (this.editSaveAction) {
			this.editSaveAction();
		}
	},

	onEditCancel: function () {
		if (this.editCancelAction) {
			this.editCancelAction();
		}
	},

	__showContactButtons: function () {
		this.clearButtons();

		var presenceCls = this.currentPresence ? this.currentPresence.getName() : 'unavailable',
			isOnline = this.currentPresence && this.currentPresence.isOnline();

		this.addButton({
			cls: 'unfollow',
			action: 'onUnfollow',
			label: 'Unfollow'
		});

		this.addButton({
			cls: 'presence ' + presenceCls,
			action: 'onMessage',
			label: 'Message',
			tip: isOnline ? '' : this.user.getName() + ' is offline.'
		});
	},

	__showNonContactButtons: function () {
		this.clearButtons();

		this.addButton({
			cls: 'follow',
			action: 'onFollow',
			label: 'Follow'
		});
	},

	onFollow: function () {
		this.addContact();
	},

	onUnfollow: function () {
		this.removeContact();
	},

	onMessage: function () {
		if (this.currentPresence && this.currentPresence.isOnline()) {
			this.ChatActions.startChat(this.user);
		}
	},

	onPresenceChanged: function (username, presence) {
		//if we aren't ready to show a user, or the update isn't for this user don't do anything
		if (!this.user || !this.rendered || username !== this.user.getId()) { return; }

		this.__updatePresence(presence);
	},

	maybeEditAvatar: function (e) {
		if (!e.getTarget('.editing')) {
			return;
		}

		var win = SettingsWindow.create();

		win.show();
		win.center();
	}
});
