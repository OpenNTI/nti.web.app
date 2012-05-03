Ext.define('NextThought.view.menus.Search',{
	extend: 'Ext.container.Container',
	alias: 'widget.search-menu',
	requires: [
		'NextThought.view.form.fields.SearchField',
		'NextThought.view.menus.search.More',
		'NextThought.view.menus.search.Result',
		'NextThought.view.menus.search.ResultCategory'
	],

	cls: 'main-nav-menu search-menu',
	ui: 'nav-container',
	autoScroll: true,
	layout: 'anchor',
	defaults: {
		anchor: '100%'
	},


	items: [
		{ xtype: 'searchfield' },
		{ xtype: 'container', id: 'search-results', hideMode: 'display' }
	],

	/**
	 * This is to allow the navigation controller to "activate" the search view by interface methods, but not actually
	 * change the view, but just change the menu.
	 */
	activate: function(){
		Ext.ComponentQuery.query('main-views').first().fireEvent('activate-view','search');
		this.up('[ui=menu-wrapper]').getLayout().setActiveItem(this);
	}
});
