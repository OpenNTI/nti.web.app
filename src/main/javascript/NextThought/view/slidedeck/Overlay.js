Ext.define('NextThought.view.slidedeck.Overlay',{
	extend: 'Ext.container.Container',
	alias: 'widget.slidedeck-overlay',
	requires: [
		'NextThought.view.slidedeck.View'
	],

	cls: 'overlay',
	ui: 'slidedeck',
	plain: true,
	layout: 'fit',
	maximized: true,
	floating: true,

	initComponent: function(){
		this.callParent(arguments);
		this.view = this.add({xtype:'slidedeck-view'});

		this.mon(this.view,'destroy',this.destroy,this);
		Ext.EventManager.onWindowResize(this.setSize,this,false);
	},

	setSize: function(){
		if(this.rendered){this.toFront();}
		return this.callParent(arguments);
	}
});
