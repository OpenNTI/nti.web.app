Ext.define('NextThought.view.menus.Flyout',{
	extend: 'Ext.menu.Menu',
	alias: 'widget.nav-flyout',
	requires: [
		'Ext.tree.Panel',
		'NextThought.util.Tocs'
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

		this.on({
			scope: this,
			mouseleave: this.startHiding,
			mouseenter: this.stopHiding
		});
	},

	startHiding: function(){
		var me = this;
		this.hideTimeout = setTimeout(function(){me.hide();}, 1000);
	},
	stopHiding: function(){
		this.show();
	},

	destroy: function(){
		Ext.EventManager.removeResizeListener(this.viewportMonitor,this);
	},

	viewportMonitor: function(w,h){
		this.setHeight(h);
	},

	show: function(){
		this.callParent(arguments);
		clearTimeout(this.hideTimeout);
		var n = Ext.get(this.view.getNode(this.record));
		n.addCls('menu-open');
		n.removeCls('menu-closing');
		this.removeCls('menu-closing');
		return this;
	},

	hide: function(){
		var me = this,
			e = Ext.get(this.view.getNode(this.record)),
			c = 'menu-closing';

		e.removeCls('menu-open');
		e.addCls(c);
		me.addCls(c);
		this.hideTimout = setTimeout(function(){
			Ext.menu.Menu.prototype.hide.call(me);
			e.removeCls(c);
			me.removeCls(c);
		},1000);
	}
});
