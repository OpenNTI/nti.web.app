Ext.define('NextThought.controller.Search', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.providers.Location',
        'NextThought.cache.LocationMeta',
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
		'menus.search.NoResults',
		'menus.search.Error',
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

		this.getHitStore().on('beforeload', function(){
			Ext.getCmp('search-results').el.mask('Searching...');
		});
	},


	storeLoad: function(store, records, success, opts, searchVal){
		var results = [], menu = Ext.getCmp('search-results');
		Ext.getCmp('search-results').el.unmask();
		if (!success) {
			console.error('Store did not load correctly!, Do something, no results???');
			results.push({xtype:'search-result-category', category: '', items:[{xtype: 'search-error'}]});
		}
		else{
			//get the groups storted by type, cause the display to chunk them.
			var resultGroups = store.getGroups(),
			result, loc,
			me = this;

			if(resultGroups.length === 0){
				results.push({xtype:'search-result-category', category: '', items:[{xtype: 'search-noresults'}]});
			}

			Ext.each(resultGroups, function(group){
				result = {xtype:'search-result-category', category: this.sanitizeCategoryName(group.name), items:[]};
				results.push(result);
				result = result.items;

				Ext.each(group.children, function(hit){
					var id = hit.get('ContainerId'),
					    sortIndexes = LocationProvider.getSortIndexes(id);

					sortIndexes.pop();
					sortIndexes.reverse();

					result.push( {
                        ntiid: id,
						name: hit.get('Creator'),
						snippet: hit.get('Snippet'),
						term: searchVal,
						containerId: hit.get('ContainerId'),
						hitId: hit.getId(),
						sortId:sortIndexes,
						fragments: hit.get('Fragments')
					});
				},	this);


				result = Ext.Array.sort(result, me.sortSearchHits, me);
			}, this);
		}

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

	sortSearchHits: function(aa,bb){

		function compareIndices(i, j){
			if(i===j) { return 0; }
			return i < j ? -1: 1;
		}

		var a = aa.sortId,
			b = bb.sortId,
			max = (a.length < b.length) ? a.length : b.length,
			i, r;

		for(i=0; i<max; i++){
			r = compareIndices(a[i], b[i]);
			if(r !== 0) { return r;}
		}

		if(a.length === b.length){ return 0;}
		return a.length > b.length ? 1: -1;
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
		var nav = this.getController('Navigation'),
			cid = result.containerId,
			cat = result.up('search-result-category').category;

		function success(obj){
			var refs = (obj.get('references')||[]).slice();
			refs.push(obj.getId());
			nav.navigate(cid,refs);
		}

		function failure(){
			console.log("Could not retrieve rawData for: ",result.hitId);
			console.log("Error: ", arguments);
			alert('An unexpected error has occured.');
		}

		if (!cid) {
			console.error('No container ID taged on search result, cannot navigate.');
			return;
		}

		Ext.ComponentQuery.query('library-view-container')[0].activate();

		if(cat==='Books'){
			nav.navigateAndScrollToTerm(cid,result.term);
			return;
		}

		$AppConfig.service.getObject(result.hitId, success, failure);
	},


	showAllForCategoryClicked: function(more) {
		var cat = more.up('search-result-category');
		cat.showAll();
	}
});
