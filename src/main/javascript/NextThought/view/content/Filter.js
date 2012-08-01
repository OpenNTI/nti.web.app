Ext.define('NextThought.view.content.Filter',{
	extend: 'Ext.Component',
	alias: 'widget.content-filter',
	requires: [
		'NextThought.view.menus.Filter'
	],
	ui: 'content-filter',

	renderTpl: [
		'<div class="shrink-wrap">',
			'<div class="label"><span>Show Me</span></div>',
			'<div class="menu"><span>Everything from Everyone</span></div>',
		'</div>'
	],

	renderSelectors: {
		shrinkWrapEl: '.shrink-wrap',
		labelEl: '.label span',
		menuEl: '.menu span'
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
