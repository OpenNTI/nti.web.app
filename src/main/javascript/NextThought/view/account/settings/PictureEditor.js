Ext.define('NextThought.view.account.settings.PictureEditor',{
    extend:'Ext.container.Container',
    alias: 'widget.picture-editor',

	requires: [
		'NextThought.view.account.settings.PictureCanvas'
	],

	cls: 'picture-editor',
    ui: 'account',

	layout: {
		type: 'vbox',
		align: 'stretch'
	},

	items: [
		{ xtype: 'picture-canvas' },
		{
			xtype: 'container',
			cls: 'footer',
			layout: {
				type: 'hbox',
				pack: 'end',
				align: 'middle'
			},
			defaultType: 'button',
			defaults: {
				scale: 'medium',
				ui: 'flat',
				handler: function(btn){
					btn.up('picture-editor').buttonHandler(btn,Boolean(btn.save));
				}
			},
			items: [
				{text: 'Cancel' },
				{text: 'Save', save:true, ui: 'flat-blue' }
			]
		}
	],



	buttonHandler: function(btn, isSave){
		this.up('account-window').changeView({
			associatedPanel: 'avatar-choices',
			pressed: true
		});
	}


});
