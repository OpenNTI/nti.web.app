Ext.define('NextThought.app.profiles.group.components.Header', {
	extend: 'NextThought.app.profiles.components.Header',
	alias: 'widget.profile-group-header',

	requires: [
	],

	cls: 'profile-header group-header',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'buttons'},
		{cls: 'outline', cn: [
			{cls: 'avatar-container'},
			{cls: 'meta', cn: [
				{cls: 'about', cn: [
					{cls: 'field-container', cn: [
						{cls: 'field username', 'data-field': 'alias'}
					]},
					{cls: 'field about', 'data-field': 'about'}
				]}
			]},
			{cls: 'tabs'}
		]}
	]),


	renderSelectors: {
		avatarContainerEl: '.avatar-container',
		usernameEl: '.about .username',
		aboutFieldEl: '.about .field.about',
		tabsEl: '.tabs',
		buttonsEl: '.buttons'
	},



	updateEntity: function(entity, tabs) {
		if (!this.rendered) {
			this.on('afterrender', this.updateUser.bind(this, entity, tabs));
			return;
		}

		this.entity = entity;
		Ext.destroy(this.userMonitor);

		this.userMonitor = this.mon(entity, {
			destroyable: true,
			'changed': this.fillInEntity.bind(this, entity)
		});

		this.fillInEntity(entity);

		this.__updateTabs(tabs);
		this.clearButtons();

		if (this.entity.getLink('my_membership')) {
			this.addButton({
				cls: 'leave',
				action: 'leaveGroup',
				label: 'Leave Group'
			});
		}
	},


	fillInEntity: function(entity) {
		var data = entity.getAboutData();

		this.avatarContainerEl.dom.innerHTML = Ext.util.Format.avatar(entity);
		this.usernameEl.update(data.displayName);

	    this.aboutFieldEl.dom.innerHTML = data.about || '';
	},

	setSchema: function(schema) {},


	__updateTabs: function(tabs) {
		this.clearTabs();

		tabs.forEach(this.addTab.bind(this));
	},


	leaveGroup: function() {
		if (this.doLeaveGroup) {
			this.doLeaveGroup();
		}
	}
});
