Ext.define('NextThought.view.menus.SearchFieldBox',{
	extend: 'Ext.container.Container',
	alias: 'widget.search-field-box',
	requires: [

	],
	renderTpl: [
		'<div class="search-box">',
			'{%this.renderContainer(out,values)%}',
		'</div>'
	],
	layout: 'hbox',
	margin: 12,
	items: [ { xtype: 'searchfield', flex: 1 } ]
});
