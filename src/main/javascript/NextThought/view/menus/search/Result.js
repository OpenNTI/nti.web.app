Ext.define('NextThought.view.menus.search.Result',{
	extend: 'Ext.Component',
	alias: 'widget.search-result',
	cls: 'search-result',
	renderTpl: [
		'<div class="title">{title}</div>',
		'<tpl if="section"><div class="section">{section}</div></tpl>',
		'<div class="snippet">{snippet}</div>'
	],

	initComponent: function(){
		this.callParent(arguments);
		this.renderData = Ext.copyTo({},this,'title,section,snippet');
	},

	afterRender: function() {
		this.callParent(arguments);
		this.getEl().on('click', function(){
			this.fireEvent('click', this);
		}, this);
	}
});
