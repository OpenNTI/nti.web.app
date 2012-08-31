Ext.define('NextThought.view.MessageBox',{
	extend: 'Ext.window.MessageBox',

	plain: true,
	border: false,
	frame: false,
	shadow: false,
	ui: 'nti-alert',
	cls: 'nti-alert',
	minWidth: 370,

	CANCEL : 1,
	NO : 2,
	YES : 4,
	OK : 8,

	buttonText: {
		ok: 'Ok',
		yes: 'Yes',
		no: 'No',
		cancel: 'Cancel'
	},

	buttonIds: [
		'cancel', 'no', 'yes', 'ok'
	],

	makeButton: function(btnIdx) {
		var btnId = this.buttonIds[btnIdx];

		return new Ext.button.Button({
			handler: this.btnCallback,
			itemId: btnId,
			ui: 'alert',
			scale: 'medium',
			scope: this,
			margin: 10,
			text: this.buttonText[btnId]
		});
	},


	initComponent: function(){
		this.callParent(arguments);
		this.bottomTb.layout.pack='end';
		this.iconComponent.setWidth(65);

	},


	setTitle: function(){ this.callParent(['&#160;']); },

	show: function(cfg){
		cfg.msg = cfg.msg.replace(/\n/,'<br/>');
		Ext.applyIf(cfg,{
			title:'nonsense',
			icon: Ext.MessageBox.WARNING
		});
		return this.callParent([cfg]);
	}

}, function(){
	Ext.MessageBox = Ext.Msg = new this();
});
