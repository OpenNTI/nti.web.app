Ext.define('NextThought.view.profiles.create.PictureEditor', {
	extend: 'Ext.Component',
	alias: 'widget.profile-picture-editor',

	cls: 'picture-editor',

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'picture-container',
			cn: [
				{cls: 'placeholder', cn: [
					{cls: 'span', html: '{{{NextThought.view.profiles.create.PictureEditor.DropImage}}} or'},
					{cls: 'span link', html: '{{{NextThought.view.profiles.create.PictureEditor.ChooseFile}}}'}
				]}
			]
		},
		{cls: 'footer', cn: [
			{tag: 'span', cls: 'button rotate', role: 'button', html: 'Rotate'},
			{tag: 'span', cls: 'button confirm', role: 'button', html: 'Confirm'}
		]}
	]),


	renderSelectors: {
		pictureContainerEl: '.picture-container',
		placeholderEl: '.picture-container .placeholder',
		footerEl: '.footer',
		confirmEl: '.footer .confirm'
	},


	pictureTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{cls: 'picture', cn: [
			{tag: 'img', src: '{avatarURL}'},
			{cls: 'actions', cn: [
				/*{cls: 'link edit'},*/
				{cls: 'link upload'}
			]}
		]}
	])),


	afterRender: function() {
		this.callParent(arguments);
		var avatarURL = this.user && this.user.get('avatarURL');

		this.placeholderEl.setVisibilityMode(Ext.Element.DISPLAY);
		this.footerEl.hide();
		this.createPictureCanvas();
		if (!Ext.isEmpty(avatarURL)) {
			this.createPictureElement(avatarURL);
		}


		this.mon(this.confirmEl, 'click', 'saveButtonHandler');
		this.on('saved', 'updateProfilePic', this);
	},


	createPictureElement: function(url) {
		this.placeholderEl.hide();
		this.pictureEl = Ext.get(this.pictureTpl.append(this.pictureContainerEl,
			{'avatarURL': url}
		));

		this.pictureCanvas.targetInputEl = this.pictureEl.down('.upload');
		this.pictureCanvas.createFileInput();
	},


	createPictureCanvas: function() {
		var me = this;
		me.pictureCanvas = Ext.widget({
			xtype: 'picture-canvas',
			renderTo: this.pictureContainerEl,
			targetInputEl: this.placeholderEl
		});

		me.mon(me.pictureCanvas, {
			'image-loaded': function() {
				me.placeholderEl.hide();
				if (me.pictureEl) {
					me.pictureEl.remove();
					delete me.pictureEl;
				}
				me.footerEl.show();
				me.el.addCls('hasImage');
			},
			'image-cleared': function() {
				me.placeholderEl.show();
				me.footerEl.hide();
				me.el.removeCls('hasImage');
			}
		});
	},


	saveButtonHandler: function() {
		var me = this,
			u = $AppConfig.userObject,
			c = me.pictureCanvas,
			url = c && c.getValue(event);

		u.saveField('avatarURL', url,
			function good() {
				me.fireEvent('saved', url);
			},

			function bad() {
				alert({
					title: getString('NextThought.view.account.settings.PictureEditor.error-title'),
					msg: getString('NextThought.view.account.settings.PictureEditor.error-msg')
				});
			}
		);
	},


	updateProfilePic: function(url) {
		if (this.pictureEl) {
			this.pictureEl.remove();
		}

		this.pictureCanvas.clear();
		this.createPictureElement(url);
	}
});
