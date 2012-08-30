Ext.define('NextThought.view.MessageBox',{
	extend: 'Ext.window.MessageBox',

	plain: true,
	frame: false,
	shadow: false,
	ui: 'nti-window',
	cls: 'nti-window',

	makeButton: function(btnIdx) {
		var btnId = this.buttonIds[btnIdx],
			btnUI = btnIdx <2 ? 'primary' : 'secondary';

		return new Ext.button.Button({
			handler: this.btnCallback,
			itemId: btnId,
			ui: btnUI,
			scale: 'medium',
			scope: this,
			text: this.buttonText[btnId]
		});
	},


	initComponent: function(){
		this.callParent(arguments);
		this.bottomTb.layout.pack='end';
	}


}, function(){
	Ext.MessageBox = Ext.Msg = new this();
});
