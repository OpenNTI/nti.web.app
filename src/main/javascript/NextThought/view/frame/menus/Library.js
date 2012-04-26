Ext.define('NextThought.view.frame.menus.Library',{
	requires:[
		'NextThought.Library',
		'NextThought.view.frame.menus.Flyout'
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
					'<div class="path">{path}</div>',
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
			'itemclick': me.handleMenu,
			'itemcontextmenu': function(a,b,c,d,e){
				me.handleMenu.apply(me,arguments);
				e.preventDefault();
				e.stopPropagation();
				return false;
			}
		});
	},


	handleMenu: function(me,rec,el,ix,ev,opts){
		this.menus[rec.getId()].showBy(el,'r-l?');
	},


	buildMenus: function(){
		var me = this;
		Library.each(function(o){
			me.menus[o.getId()] = Ext.widget('nav-flyout',{ view: me, record: o, toc: Library.getToc(o) });
		});
	}

});
