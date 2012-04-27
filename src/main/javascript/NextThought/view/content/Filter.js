Ext.define('NextThought.view.content.Filter',{
	extend: 'Ext.Component',
	alias: 'widget.content-filter',
	requires: [
		'NextThought.view.menus.Filter'
	],
	ui: 'content-filter',

	renderTpl: [
		'<div class="label">Show Me</div>',
		'<div class="menu">Highlights and Notes from Everyone</div>'
	],

	renderSelectors: {
		labelEl: 'div.label',
		menuEl: 'div.menu'
	},

	initComponent: function(){
		this.callParent(arguments);
		this.menu = Ext.widget('filter-menu',{ownerButton: this});
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
