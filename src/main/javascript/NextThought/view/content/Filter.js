Ext.define('NextThought.view.content.Filter',{
	extend: 'Ext.Component',
	alias: 'widget.content-filter',
	requires: [
		'NextThought.view.menus.Filter'
	],
	ui: 'content-filter',

	renderTpl: [
		'<div class="label">Show Me</div>',
		'<div class="menu">Everything from Everyone</div>'
	],

	renderSelectors: {
		labelEl: 'div.label',
		menuEl: 'div.menu'
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
				}
			}
		});
	},

	afterRender: function(){
		this.callParent();
		this.el.addClsOnOver('over')
				.addClsOnFocus('active')
				.on('click',this.clicked,this);
	},

	clicked: function(){
		this.menu.showBy(this.el,'t-b?');
	}
});
