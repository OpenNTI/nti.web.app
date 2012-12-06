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
		var store = this.store, keyMap;
		this.view = this.add({xtype:'slidedeck-view', store: store});
		//clean up references, we don't actually use the store here, so just pass it down.
		delete this.store;

		this.mon(this.view,'destroy',this.destroy,this);
		Ext.EventManager.onWindowResize(this.setSize,this,false);

		keyMap = new Ext.util.KeyMap({
			target: document,
			binding: [{
				key: Ext.EventObject.ESC,
				fn: this.destroy,
				scope: this
			},{
				key: Ext.EventObject.TAB,
				fn: this.tabNext,
				scope: this
			}]
		});
		this.on('destroy',function(){keyMap.destroy(false);});
	},

	afterRender: function(){
		this.callParent(arguments);
		this.el.set({role:'dialog'});
	},


	tabNext: function(k,e){
		e.stopEvent();
		var a = this.el.query('[tabindex]'),i;
		i = Ext.Array.indexOf(a, (this.el.down('[tabindex]:focus') || {}).dom) + 1;
		a[i % a.length].focus();
		return false;
	},


	setSize: function(){
		if(this.rendered){this.toFront();}
		return this.callParent(arguments);
	}
});
