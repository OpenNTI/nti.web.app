Ext.define('NextThought.app.account.settings.components.PictureEditor', {
	extend: 'Ext.container.Container',
	alias: 'widget.picture-editor',

	requires: [
		'NextThought.app.account.settings.components.PictureCanvas'
	],

	cls: 'picture-editor',
	ui: 'account',

	layout: 'none',

	items: [
		{ xtype: 'picture-canvas' },
		{
			xtype: 'container',
			cls: 'footer',
			layout: 'none',
			defaultType: 'button',
			defaults: {
				scale: 'medium',
				ui: 'flat',
				handler: function(btn, event) {
					btn.up('picture-editor').buttonHandler(btn, Boolean(btn.save), event);
				}
			},
			items: [
				{xtype: 'tbspacer', flex: 4},
				{text: getString('NextThought.view.account.settings.PictureEditor.save'), save: true, ui: 'flat-blue', disabled: true, cls: 'save footer-btn' },
				{text: getString('NextThought.view.account.settings.PictureEditor.cancel'), cls: 'cancel footer-btn' },
				{text: getString('NextThought.view.account.settings.PictureEditor.rotate'), rotate: true, iconCls: 'rotate', cls: 'rotate footer-btn', disabled: true,
					handler: function(b) {b.up('picture-editor').rotate();} },
				{xtype: 'tbspacer', flex: 1}
			]
		}
	],


	initComponent: function() {
		var me = this;
		me.callParent(arguments);
		me.mon(me.down('picture-canvas'), {
			'image-loaded': function() {
				me.down('button[save]').enable();
				me.down('button[rotate]').enable();
				me.el.addCls('hasImage');
			},
			'image-cleared': function() {
				me.down('button[save]').disable();
				me.down('button[rotate]').disable();
				me.el.removeCls('hasImage');

			}
		});
	},


	rotate: function() {
		this.down('picture-canvas').rotate();
	},


	reset: function() {
		this.down('picture-canvas').clear();
	},


	setField: function(field) {
		this.activeField = field;
	},


	editMode: function(url) {
		this.reset();
		this.down('picture-canvas').setImage(url || $AppConfig.userObject.get('avatarURL'));
	},


	buttonHandler: function(btn, isSave, event) {
		var me = this,
			u = $AppConfig.userObject,
			c = me.down('picture-canvas'),
			w = me.up('account-window'),
			url;

		if (isSave) {
			url = c.getValue(event);
			u.saveField(me.activeField, url,

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


		}

		if(w){
			w.changeView({ associatedPanel: 'avatar-choices', pressed: true });
		}
	}


});