Ext.define('NextThought.view.frame.menus.Flyout',{
	extend: 'Ext.menu.Menu',
	alias: 'widget.nav-flyout',
	requires: [
		'Ext.tree.Panel',
		'NextThought.util.TocUtils'
	],
	ui: 'nav-flyout',
	autoScroll: false,
	plain: true,
	shadow: false,
	frame: false,
	border: false,
	hideMode: 'display',
	width: 240,
	layout: {
		type: 'fit'
	},

	initComponent: function(){
		this.callParent(arguments);
		this.add({
			xtype: 'treepanel',
			store: Ext.create('Ext.data.TreeStore', {
				proxy: 'memory',
				root: TocUtils.toJSONTreeData(this.toc)
			}),
			lines: false,
			hideHeaders: true,
			singleExpand: true,
			rootVisible: false,
			shadow: false,
			frame: false,
			border: false,
			ui: 'flyout',
			forceFit: true,
			overflowX: 'hidden',
			overflowY: 'scroll',
			scroll: 'vertical',
			viewConfig: {
				forceFit: true
			},
			listeners: {
				scope: this,
				itemclick: function(view, node) {
					var path = node.getPath('text','\u200b').split('\u200b');
					if(node.isLeaf()) {
						this.fireEvent('navigation-selected',node.raw.ntiid);
						this.updatePath(path.slice(2).join(' - '));
					}
					else if(node.isExpanded()) { node.collapse(); }
					else { node.expand(); }
				}
			}
		});

		this.setHeight(Ext.Element.getViewportHeight());
		Ext.EventManager.onWindowResize(this.viewportMonitor,this);
	},

	destroy: function(){
		Ext.EventManager.removeResizeListener(this.viewportMonitor,this);
	},


	updatePath: function(path){
		this.record.store.each(function(o){o.set('path','');});
		this.record.set('path',path);
		this.view.refresh();
	},


	viewportMonitor: function(w,h){
		this.setHeight(h);
	},

	show: function(){
		Ext.fly(this.view.getNode(this.record)).addCls('menu-open');
		return this.callParent(arguments);
	},

	hide: function(){
		Ext.fly(this.view.getNode(this.record)).removeCls('menu-open');
		return this.callParent(arguments);
	}
});
