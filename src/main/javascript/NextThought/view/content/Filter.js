Ext.define('NextThought.view.content.Filter',{
	extend: 'Ext.Component',
	alias: 'widget.content-filter',
	requires: [
		'NextThought.view.menus.Filter'
	],
	ui: 'content-filter',

	renderTpl: [
		'<div class="shrink-wrap">',
			'<div class="label">Show Me</div>',
			'<div><span class="menu">Everything from Everyone</span></div>',
		'</div>'
	],

	renderSelectors: {
		shrinkWrapEl: 'div.shrink-wrap',
		labelEl: 'div.label',
		menuEl: 'span.menu'
	},

	initComponent: function(){
		var me = this;
		me.callParent(arguments);
		me.menu = Ext.widget('filter-menu',{
			ownerButton: me,
			listeners: {
				scope: me,
				changed:function(){
					me.menuEl.update(me.menu.getDescription());
					me.ownerCt.updateLayout();
				},
				hide: function(){
					var e = me.el;
					if(e){ e.removeCls('active'); }
				}
			}
		});
	},

	afterRender: function(){
		this.callParent();
		this.shrinkWrapEl.addClsOnOver('over')
				.addClsOnFocus('active')
				.on('click',this.clicked,this);
	},

	clicked: function(){
		this.menu.showBy(this.menuEl,'tl-bl?',[-30,5]);
		this.el.addCls('active');

	}
});
