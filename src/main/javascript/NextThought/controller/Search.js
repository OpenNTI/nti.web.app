Ext.define('NextThought.controller.Search', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.providers.Location',
		'NextThought.util.ViewUtils',
		'NextThought.filter.FilterGroup',
		'NextThought.filter.Filter'
	],

	models: [
		'Hit'
	],

	stores: [
		'Hit'
	],

	views: [
		'form.fields.SearchField',
		'menus.Search',
		'menus.search.ResultCategory',
		'menus.search.Result',
		'menus.search.More',
		'form.fields.SearchAdvancedOptions'
	],

	refs: [
		{
			ref: 'searchField',
			selector: 'searchfield'
		},
		{
			ref: 'searchMenu',
			selector: 'search-menu'
		}
	],


	init: function() {
		this.control({
			'searchfield': {
				'search' : this.searchForValue,
				'clear-search' : this.clearSearchResults
			},
			'search-result' : {
				'click': this.searchResultClicked
			},
			'search-more' : {
				'click': this.showAllForCategoryClicked
			},
			'search-advanced-menu': {
				'changed': this.searchFilterChanged
			}
		},{});
	},


	storeLoad: function(store, records, success, opts, searchVal){
		if (!success) {
			console.error('Store did not load correctly!, Do something, no results???');
			return;
		}

		//get the groups storted by type, cause the display to chunk them.
		var resultGroups = store.getGroups(),
			category, result, loc,
			menu = Ext.getCmp('search-results');

		Ext.each(resultGroups, function(group){
			console.log('got a group for ' + group.name, 'with children', group.children);
			category = Ext.widget('search-result-category', {category: this.sanitizeCategoryName(group.name)});
			Ext.each(group.children, function(hit){
				loc = LocationProvider.getLocation(hit.get('ContainerId'));
				result = Ext.widget('search-result', {
					title: loc ? loc.title.get('title') : 'Untitled',
					section: loc ? loc.label : 'Unlabeled',
					snippet: this.addSpansToSnippet(hit.get('Snippet'), searchVal),
					containerId: hit.get('ContainerId')
				});
				category.addResult(result);
			}, this);
			menu.add(category);
		}, this);

		//show results...
		menu.hide().show();
	},


	sanitizeCategoryName: function(n){
		if (n.toLowerCase()==='content') {
			return 'Books';
		}
		return n;
	},


	addSpansToSnippet: function(snippet, searchVal) {
		var u = searchVal.toUpperCase(),
			re = new RegExp(u, 'g');
		return snippet.replace(re, '<span>'+u+'</span>');
	},


	searchForValue: function(value) {
		if(!value || value.length < 4){return;}

		var s = this.getHitStore(),
			filter = this.modelFilter,
			rootUrl = $AppConfig.service.getUserUnifiedSearchURL(),
			loc = LocationProvider.currentNTIID || 'noNTIID',
			url = [
				rootUrl,
				loc,
				'/',
				value
			];

		//clear old results from both store and search results.
		this.clearSearchResults();
		s.removeAll();

		s.clearFilter();
		if(filter){
			s.filter([{filterFn: function(item) { return filter.test(item); }} ]);
		}
		s.proxy.url = url.join('');
		s.on('load', Ext.bind(this.storeLoad, this, [value], true), this, {single: true});
		s.load();
	},


	clearSearchResults: function() {
		Ext.getCmp('search-results').removeAll(true);

	},


	searchFilterChanged: function(menu) {
		var allItems = menu.query('menuitem'),
			Filter = NextThought.Filter,
			everything = menu.down('[isEverything]').checked,
			searchValue = this.getSearchField().getValue();

		this.modelFilter = new NextThought.FilterGroup(menu.getId(),NextThought.FilterGroup.OPERATION_UNION);

		Ext.each(allItems, function(item){
			if ((everything || item.checked) && item.model) {
				this.modelFilter.addFilter(new Filter('Type',Filter.OPERATION_INCLUDE, item.model));
			}
		}, this);

		this.searchForValue(searchValue);
	},


	searchResultClicked: function(result){
		var cid = result.containerId;

		if (!cid) {
			console.error('No container ID taged on search result, cannot navigate.');
			return;
		}

		Ext.ComponentQuery.query('library-view-container')[0].activate();
		LocationProvider.setLocation( cid );
	},


	showAllForCategoryClicked: function(more) {
		var cat = more.up('search-result-category');
		cat.showAll();
	}
});
