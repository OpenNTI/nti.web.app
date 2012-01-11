Ext.define('NextThought.view.windows.FullScreenFormWindow', {
	extend: 'Ext.panel.Panel',
	alias : 'widget.fullscreen-window',

	width: 600,

	floating: true,
	constrain: true,
	frame: true,
	modal: true,
	layout: 'fit',

	initComponent: function(){
		this.callParent(arguments);
		this.addDocked({
			xtype: 'toolbar', dock: 'bottom', ui: 'footer',
			layout: { pack: 'center' },
			items: [
				{ minWidth: 80, text: 'Save', actionName: 'save' },
				{ minWidth: 80, text: 'Cancel', actionName: 'cancel' }
			]
		});

		Ext.EventManager.onWindowResize(this.doResize,this);
		this.setHeight(Ext.getBody().getHeight());
	},

	destroy: function(){
		Ext.EventManager.removeResizeListener(this.doResize,this);
		this.callParent(arguments);
	},

	doResize: function(w, h){
		this.setHeight(h);
		this.center();
	}

});
