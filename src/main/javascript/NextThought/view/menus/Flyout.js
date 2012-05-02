Ext.define('NextThought.view.menus.Flyout',{
	extend: 'Ext.menu.Menu',
	alias: 'widget.nav-flyout',
	requires: [
		'Ext.tree.Panel',
		'NextThought.util.TocUtils'
	],
	ui: 'nav-flyout',
	defaultAlign: 'r-l?',
	ignoreParentClicks: true,
	autoScroll: false,
	plain: true,
	shadow: false,
	frame: false,
	border: false,
	hideMode: 'display',
	width: 240,
	maxWidth: 240,
	layout: 'fit',

	initComponent: function(){
		var me = this;
		this.callParent(arguments);
		this.add({
			xtype: 'treepanel',
			store: Ext.create('Ext.data.TreeStore', {
				proxy: 'memory',
				root: TocUtils.toJSONTreeData(this.toc)
			}),
			columns: [{
				xtype		: 'treecolumn',
				text		: 'Name',
				dataIndex	: 'text'
//				width		: 1000
			}],
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
			overflowY: 'auto',
			scroll: 'vertical',
			viewConfig: {
				forceFit: true
			},
			listeners: {
				scope: this,
				itemclick: function(view, node) {
					var fn = node.expand;
					if(node.isLeaf()) {
						this.fireEvent('navigation-selected',node.raw.ntiid);
						this.hide();
						return;
					}

					if(node.isExpanded()) { fn = node.collapse; }
					fn.call(node,false,function(){
						setTimeout(function(){
							var e = view.el.dom,
								s = (e.clientWidth - e.scrollWidth)< 0,
								c = 'hasScrollbar';

							if(s){ view.el.addCls(c); }
							else { view.el.removeCls(c); }
							me.doLayout();
						},250);
					},me);
				}
			}
		});

		this.setHeight(Ext.Element.getViewportHeight());
		Ext.EventManager.onWindowResize(this.viewportMonitor,this);
	},

	destroy: function(){
		Ext.EventManager.removeResizeListener(this.viewportMonitor,this);
	},

//
//
//	updatePath: function(path){
//		var s = this.record.store,
//			e = Ext.get(this.view.getNode(this.record));
//		s.suspendEvents(false);
//		s.each(function(o){o.set('path','');});
//		this.record.set('path',path);
//		s.resumeEvents();
//
//		Ext.get(e.up('.main-nav-menu').query('.path')).update('');
//		e.down('.path').update(path);
//	},


	viewportMonitor: function(w,h){
		this.setHeight(h);
	},

	show: function(){
		Ext.fly(this.view.getNode(this.record)).addCls('menu-open');
		return this.callParent(arguments);
	},

	hide: function(){
		Ext.fly(this.view.getNode(this.record)).removeCls('menu-open');
		this.view.refresh();
		return this.callParent(arguments);
	}
});
