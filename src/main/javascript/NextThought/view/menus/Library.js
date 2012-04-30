Ext.define('NextThought.view.menus.Library',{
	requires:[
		'NextThought.Library',
		'NextThought.view.menus.Flyout'
	],
//	extend: 'Ext.panel.Panel',
	extend: 'Ext.view.View',
	alias: 'widget.library-menu',

	cls: 'main-nav-menu library-menu',
	ui: 'nav-container',

	emptyText: 'No titles available',

	tpl: [
		'<tpl for=".">',
			'<div class="nav-item-wrap">',
				'<div class="nib"></div>',
				'<div class="item">',
					'<div class="title">{title}</div>',
				'</div>',
			'</div>',
		'</tpl>'
	],

	multiSelect: false,
	singleSelect: true,
	trackOver: true,
	selectedItemCls: 'selected',
	overItemCls: 'over',
	itemSelector: 'div.nav-item-wrap',

	initComponent: function(){
		var me = this;
		me.store = Library.getStore();
		me.menus = {};
		Library.on('loaded',me.buildMenus,me);
		me.callParent(arguments);

		me.on({
			scope: me,
			'ItemMouseUp': me.handleMenu,
			'itemcontextmenu': function(a,b,c,d,e){
				me.handleMenu.apply(me,arguments);
				e.preventDefault();
				e.stopPropagation();
				return false;
			}
		});
	},


	handleMenu: function(me,rec){
		me.select(rec);
		me.menus[rec.getId()].showBy(me.getNodeByRecord(rec));
	},


	buildMenus: function(){
		var me = this;
		Library.each(function(o){
			me.menus[o.getId()] = Ext.widget('nav-flyout',{ view: me, record: o, toc: Library.getToc(o) });
		});
	}

});
