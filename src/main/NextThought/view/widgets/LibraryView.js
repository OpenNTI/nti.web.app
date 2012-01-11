Ext.define('NextThought.view.widgets.LibraryView', {
	extend: 'Ext.view.View',
	alias: 'widget.library-view',
	requires:[
		'NextThought.Library'
	],

	cls: 'x-libraryview-panel',
	emptyText: 'No titles available',

	tpl: [
		'<tpl for=".">',
			'<div class="item-wrap">',
				'<div class="item">',
					'<img src="{[_AppConfig.server.host]}{icon}" title="{title}"></div>',
				'<span>{title}</span></div>',
		'</tpl>',
		'<div class="x-clear"></div>'
	],

	/*
	'Archive Last Modified', type: 'date', dateFormat: 'timestamp' },
	'archive'
	'href'
	'icon'
	'index'
	'installable'
	'root'
	'title'
	'version'
	*/

	multiSelect: false,
	singleSelect: true,
	trackOver: true,
	overItemCls: 'x-item-over',
	itemSelector: 'div.item-wrap',

	initComponent: function(){
		this.store = Library.getStore();
		this.callParent(arguments);
	}
});
