Ext.define('NextThought.view.profiles.create.Window', {
	extend: 'NextThought.view.window.Window',
	alias: 'widget.profile-create-window',
	requires: [
		'NextThought.view.profiles.create.View',
		'NextThought.view.profiles.create.PictureEditor'
	],

	cls: 'profile-create-window',
	ui: 'nt-window',
	minimizable: false,
	constrain: true,
	modal: true,
	closable: true,
	resizable: false,
	dialog: true,
	closeAction: 'destroy',

	width: 720,

	childEls: ['body'],
	getTargetEl: function() {
		return this.body;
	},

	componentLayout: 'natural',
	layout: 'auto',


	getDockedItems: function() {
		return [];
	},

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', cn: [
			{cls: 'title', html: '{{{NextThought.view.profiles.create.Window.title}}}'}
		]},
		{cls: 'picture-editor-container'},
		{id: '{id}-body', cls: 'container-body scrollable', html: '{%this.renderContainer(out,values)%}'},
		{cls: 'footer', cn: [
			{tag: 'a', cls: 'button confirm', role: 'button', html: '{{{NextThought.view.profiles.create.Window.Save}}}'},
			{tag: 'a', cls: 'button cancel', role: 'button', html: '{{{NextThought.view.profiles.create.Window.Cancel}}}'}
		]}
	]),


	renderSelectors: {
		cancelEl: '.footer .cancel',
		confirmEl: '.footer .confirm',
		pictureContainerEl: '.picture-editor-container'
	},


	items: [],

	initComponent: function() {
		this.callParent(arguments);
		this.user = $AppConfig.userObject;
		this.fieldsCmp = this.add({xtype: 'profile-create-view', user: this.user, width: 420});
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.applyIf(this.renderedData || {}, {
			avatarURL: this.user && this.user.get('avatarURL')
		});
	},


	afterRender: function() {
		this.callParent(arguments);
		this.createPictureEditor();
		this.mon(this.cancelEl, 'click', this.fieldsCmp.fireEvent.bind(this.fieldsCmp, 'cancel-edits', this.maybeClose.bind(this)));
		this.mon(this.confirmEl, 'click', this.fieldsCmp.fireEvent.bind(this.fieldsCmp, 'save-edits', this.close.bind(this)));
	},


	maybeClose: function(success, force) {
		if (success || force) {
			this.close();
		}
	},


	createPictureEditor: function() {
		this.pictureCmp = Ext.widget({
			xtype: 'profile-picture-editor',
			renderTo: this.pictureContainerEl,
			width: 260,
			height: 290,
			user: this.user
		});
	}
});
