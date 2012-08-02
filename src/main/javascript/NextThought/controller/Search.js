Ext.define('NextThought.controller.Search', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.providers.Location',
		'NextThought.util.Views',
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
			result, loc, results = [],
			menu = Ext.getCmp('search-results');

		Ext.each(resultGroups, function(group){
			result = {xtype:'search-result-category', category: this.sanitizeCategoryName(group.name), items:[]};
			results.push(result);
			result = result.items;

			Ext.each(group.children, function(hit){
				loc = LocationProvider.getLocation(hit.get('ContainerId'));
				result.push( {
					xtype: 'search-result',
					title: loc ? loc.title.get('title') : 'Untitled',
					section: loc ? loc.label : 'Unlabeled',
					snippet: hit.get('Snippet'),
					term: searchVal,
					containerId: hit.get('ContainerId'),
					hitId: hit.getId()
				});
			}, this);
		}, this);

		menu.removeAll(true);
		menu.add(results);
		//show results...
		menu.hide().show();
	},


	sanitizeCategoryName: function(n){
		if (n.toLowerCase()==='content') {
			return 'Books';
		}
		return n;
	},


	searchForValue: function(value) {
		if(!value){return;}

		var s = this.getHitStore(),
			filter = this.modelFilter,
			partial = this.doPartialSearch,
			rootUrl = $AppConfig.service.getUserUnifiedSearchURL(),
			loc = LocationProvider.currentNTIID || 'noNTIID',
			url = [
				rootUrl,
				loc,
				'/',
				value,
				partial? '*':''
			];

		//clear old results from both store and search results.
		this.clearSearchResults();
		s.removeAll();

		s.clearFilter();
		if(filter){
			s.filter([{filterFn: function(item) {
				return filter.test(item); }} ]);
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

		this.doPartialSearch = menu.down('[doPartialSearch]').checked;
		this.modelFilter = new NextThought.FilterGroup(menu.getId(),NextThought.FilterGroup.OPERATION_UNION);

		Ext.each(allItems, function(item){
			if ((everything || item.checked) && item.model) {
				this.modelFilter.addFilter(new Filter('Type',Filter.OPERATION_INCLUDE, item.model));
			}
		}, this);

		this.searchForValue(searchValue);
	},


	searchResultClicked: function(result){
		var cid = result.containerId,
			cat = result.up('search-result-category').category;

		if (!cid) {
			console.error('No container ID taged on search result, cannot navigate.');
			return;
		}

		Ext.ComponentQuery.query('library-view-container')[0].activate();
		LocationProvider.setLocation( cid, function(reader){
			if (cat === 'Note') {
				reader.scrollToTarget(IdCache.getComponentId(result.hitId,null,'default'));
			}
			else {
				reader.scrollToText(result.term);
				result.on('destroy', reader.clearSearchRanges,reader,{single:true});
			}
		});
	},


	showAllForCategoryClicked: function(more) {
		var cat = more.up('search-result-category');
		cat.showAll();
	}
});
