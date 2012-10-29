Ext.define('NextThought.view.MessageBox',{
	extend: 'Ext.window.MessageBox',

	plain: true,
	border: false,
	frame: false,
	shadow: false,
	ui: 'nti-alert',
	cls: 'nti-alert',
	minWidth: 390,
	maxWidth: 500,

	CANCEL : 1,
	NO : 2,
	YES : 4,
	OK : 8,

	iconHeight: 75,

	buttonText: {
		ok: 'OK',
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
			ui: 'secondary',
			scale: 'large',
			scope: this,
			text: this.buttonText[btnId],

			xhooks: {
				setText: function(text){
					if(/delete/i.test(text)){
						this.setUI('caution');
					}
					else if(/accept/i.test(text)){
						this.setUI('primary');
					}
					else {
						console.log('hey!',arguments);
						this.setUI('secondary');
					}

					return this.callParent(arguments);
				}
			}
		});
	},


	initComponent: function(){
		this.callParent(arguments);
		this.bottomTb.layout.pack='end';
		this.iconComponent.setWidth(80);

	},


	setTitle: function(){ this.callParent(['&#160;']); },

	show: function(cfg){
		Ext.applyIf(cfg,{
			title:'Attention...',
			icon: Ext.MessageBox.WARNING
		});

		cfg.msg = cfg.title+'<div class="message">'+cfg.msg+'</div>';
		cfg.msg = cfg.msg.replace(/\n/,'<br/>');
		return this.callParent([cfg]);
	}

}, function(){
	Ext.MessageBox = Ext.Msg = new NextThought.view.MessageBox();
	window.alert = function(cfg, fn){
		Globals.removeLoaderSplash();
		if (!cfg || Ext.isString(cfg)) {
            cfg = { msg : cfg||'No Message' };
        }

		Ext.applyIf(cfg, {
			icon: Ext.Msg.WARNING,
			buttons: Ext.Msg.OK,
			fn: Ext.isFunction(fn) ? fn : undefined
		});
		Ext.MessageBox.alert(cfg);
	};
});
