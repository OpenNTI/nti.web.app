Ext.define('NextThought.view.MessageBox',{
	extend: 'Ext.window.MessageBox',

	plain: true,
	border: false,
	frame: false,
	shadow: false,
	ui: 'nti-alert',
	cls: 'nti-alert',

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
		this.iconComponent.setWidth(75);
	},


	setTitle: function(){ this.callParent(['&#160;']); },

	show: function(cfg){
		Ext.applyIf(cfg,{
			title:'nonsense',
			icon: Ext.MessageBox.WARNING
		});
		return this.callParent([cfg]);
	}

}, function(){
	Ext.MessageBox = Ext.Msg = new this();
});
