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
		{ xtype: 'container', id: 'search-results'
			/*
				These will be added as the result of a search, for now the example will remain here until search actually works!!!

			, items: [

			{ xtype: 'search-result-category',
				category: 'Books',
				items :[
				{xtype: 'search-result', title: 'Pre Algebra', section: 'Number Theory', snippet: 'Prime <span>Factor</span>ization'},
				{xtype: 'search-result', title: '2012 Math Counts School Handbook', section: 'Warm-Up 1', snippet: 'greatest prime <span>factor</span>...'},
				{xtype: 'search-more'}
			]},

			{ xtype: 'search-result-category',
				category: 'Notes',
				items :[
				{xtype: 'search-result', title: 'William Wallace', snippet: '&ldquo;When we <span>factor</span> an...&rdquo;'}
			]},

			{ xtype: 'search-result-category',
				category: 'Highlights',
				items :[
				{xtype: 'search-result', title: 'Me', snippet: '&ldquo;the prime <span>factor</span>s of 12.&rdquo;'},
				{xtype: 'search-result', title: 'Neil Armstrong', snippet: '&ldquo;<span>Factor</span> the following...&rdquo;'},
				{xtype: 'search-result', title: 'Barbara Bush', snippet: '&ldquo;prime <span>factor</span>izations...&rdquo;'},
				{xtype: 'search-more'}
			]}
		]
			*/

		}
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
