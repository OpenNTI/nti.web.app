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
				{text: 'Save', save:true, ui: 'flat-blue', disabled: true }
			]
		}
	],


	initComponent: function(){
		var me = this;
		me.callParent(arguments);
		me.mon(me.down('picture-canvas'),{
			'image-loaded': function(){ me.down('button[save]').enable();},
			'image-cleared': function(){ me.down('button[save]').disable();}
		});
	},


	reset: function(){
		this.down('picture-canvas').clear();
	},


	editMode: function(){
		this.reset();
		this.down('picture-canvas').setImage($AppConfig.userObject.get('avatarURL'));
	},


	buttonHandler: function(btn, isSave){
		var me = this,
			u = $AppConfig.userObject,
			c = me.down('picture-canvas'),
			w = me.up('account-window'),
			url;

		if(isSave){
			url = c.getValue();
			u.saveField('avatarURL', url,

				function good(){
					me.fireEvent('saved',url);
				},

				function bad(){
					alert({title:'Oops!',msg:'Something went wrong.'});
				}
			);


		}

		w.changeView({ associatedPanel: 'avatar-choices', pressed: true });
	}


});
