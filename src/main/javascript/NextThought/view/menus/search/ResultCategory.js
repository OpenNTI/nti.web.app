Ext.define('NextThought.view.menus.search.ResultCategory',{
	extend: 'Ext.container.Container',
	alias: 'widget.search-result-category',
	requires: [
		'NextThought.view.menus.search.Result'
	],
	cls: 'search-result-category',
	renderTpl: [
			'<div class="label">{category}</div>',
			'<div class="body">{%this.renderContainer(out,values);%}</div>'
	],

	renderSelectors: {
		frameBody: 'div.body'
	},

	initComponent: function(){
		this.callParent(arguments);
		this.renderData = Ext.copyTo({},this,'category');
	}
});
