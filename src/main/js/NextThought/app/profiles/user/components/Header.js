Ext.define('NextThought.app.profiles.user.components.Header', {
	extend: 'NextThought.app.profiles.components.Header',
	alias: 'widget.profile-user-header',

	requires: ['NextThought.app.chat.StateStore'],

	cls: 'profile-header user-header',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'buttons'},
		{cls: 'outline', cn: [
			{cls: 'avatar-container'},
			{cls: 'meta', cn: [
				{cls: 'about', cn: [
					{cls: 'field username', 'data-field': 'alias'},
					{cls: 'field education', 'data-field': 'education'},
					{cls: 'field professional', 'data-field': 'professional'},
					{cls: 'field location', 'data-field': 'location'},
					{tag: 'a', target: '_blank', cls: ' field homepage', 'data-field': 'home_page'}
				]},
				{cls: 'social', cn: [
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
		professionalEl: '.about .professional',
		locationEl: '.about .location',
		homepageEl: '.about .homepage',
		facebookEl: '.social .facebook',
		linkedInEl: '.social .linked-in',
		twitterEl: '.social .twitter',
		googleEl: '.social .google-plus',
		tabsEl: '.tabs',
		buttonsEl: '.buttons'
	},


	initComponent: function() {
		this.callParent(arguments);

		this.ChatStore = NextThought.app.chat.StateStore.getInstance();

		this.mon(this.ChatStore, 'presence-changed', this.onPresenceChanged.bind(this));
	},


	updateUser: function(user, tabs, contact, isMe) {
		if (!this.rendered) {
			this.on('afterrender', this.updateUser.bind(this, user, tabs, contact));
			return;
		}

		this.user = user;
		this.isContact = contact;
		this.isMe = isMe;

		var data = user.getAboutData(),
			presence = user.getPresence();

		this.avatarContainerEl.dom.innerHTML = Ext.util.Format.avatar(user);
		this.usernameEl.update(data.displayName);
		
		this.__updatePresence(presence);

		this.__updateTabs(tabs);
		this.clearButtons();

		if (isMe) {
			this.__showMyButtons();
		} else if (contact) {
			this.__showContactButtons();
		} else {
			this.__showNonContactButtons();
		}
	},


	setSchema: function(schema) {},


	__updatePresence: function(presence) {
		this.usernameEl.removeCls(this.currentPresence && this.currentPresence.getName());
		this.currentPresence = presence;
		this.usernameEl.addCls(this.currentPresence.getName());
	},


	__updateTabs: function(tabs) {
		this.clearTabs();

		tabs.forEach(this.addTab.bind(this));
	},


	__showMyButtons: function() {
		this.addButton({
			cls: 'edit',
			action: 'onEditProfile',
			label: 'Edit Profile'
		});
	},


	showEditingActions: function(save, cancel) {
		this.clearButtons();

		this.editSaveAction = save,
		this.editCancelAction = cancel;

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


	onEditProfile: function() {
		this.pushRoute('Edit', '/about/edit');
	},


	onEditSave: function() {
		if (this.editSaveAction) {
			this.editSaveAction();
		}
	},


	onEditCancel: function() {
		if (this.editCancelAction) {
			this.editCancelAction();
		}
	},

	__showContactButtons: function() {},


	__showNonContactButtons: function() {},


	onPresenceChanged: function(username, presence) {
		//if we aren't ready to show a user, or the update isn't for this user don't do anything
		if (!this.user || !this.rendered || username !== this.user.getId()) { return; }

		this.__updatePresence(presence);
	}
});