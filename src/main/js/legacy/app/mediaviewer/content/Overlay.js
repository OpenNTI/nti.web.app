var Ext = require('extjs');



// FIXME: Maybe delete this? We no longer use a different version of slidedeck
// We use the mediaviewer for showing both videos and slidedeck.
module.exports = exports = Ext.define('NextThought.app.mediaviewer.content.Overlay', {
	extend: 'Ext.container.Container',
	alias: 'widget.slidedeck-overlay',
	cls: 'overlay',
	ui: 'slidedeck',
	plain: true,
	layout: 'fit',
	maximized: true,
	floating: true,

	initComponent: function() {
		this.callParent(arguments);
		var me = this,
			store = me.store,
			keyMap;
		this.view = me.add({xtype: 'slidedeck-view', store: store, startOn: me.startOn});
		//clean up references, we don't actually use the store here, so just pass it down.
		delete me.store;
		delete me.startOn;

		me.mon(me.view, 'destroy', me.destroy, me);
		Ext.EventManager.onWindowResize(me.setSize, me);

		keyMap = new Ext.util.KeyMap({
			target: document,
			binding: [{
				key: Ext.EventObject.ESC,
				fn: me.destroy,
				scope: me
			},{
				key: Ext.EventObject.TAB,
				fn: me.tabNext,
				scope: me
			}]
		});
		me.on('destroy', function() {
			keyMap.destroy(false);
			Ext.EventManager.removeResizeListener(me.setSize, me);
		});
	},

	afterRender: function() {
		this.callParent(arguments);
		this.el.set({role: 'dialog'});
	},

	tabNext: function(k, e) {
		e.stopEvent();
		var a = this.el.query('[tabindex]'), i;
		i = Ext.Array.indexOf(a, (this.el.down('[tabindex]:focus') || {}).dom) + 1;
		a[i % a.length].focus();
		return false;
	},

	setSize: function() {
		if (this.rendered) {this.toFront();}
		return this.callParent(arguments);
	}
});
