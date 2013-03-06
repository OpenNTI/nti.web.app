
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
		'menus.search.Result-Chat',
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
				'click': this.searchResultClicked,
				'click-blog-result': this.searchBlogResultClicked
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
		var results = [], menu = Ext.getCmp('search-results'),
			resultGroups, result, loc, type, alias, me = this;

		Ext.getCmp('search-results').el.unmask();
		if (!success) {
			console.error('Store did not load correctly!, Do something, no results???');
			results.push({xtype:'search-result-category', category: '', items:[{xtype: 'search-error'}]});
		}
		else{
			//get the groups storted by type, cause the display to chunk them.
			resultGroups = store.getGroups(false);

			if(resultGroups.length === 0){
				results.push({xtype:'search-result-category', category: '', items:[{xtype: 'search-noresults'}]});
			}

			Ext.each(resultGroups, function(group){
				result = {xtype:'search-result-category', category: this.sanitizeCategoryName(group.name), items:[]};
				results.push(result);
				result = result.items;
				type = "search-result";//default type
				alias = "widget.search-result-"+group.name.toLowerCase();

				Ext.each(group.children, function(hit){
					var id = hit.get('ContainerId'),
					    sortIndexes = LocationProvider.getSortIndexes(id);

					sortIndexes.reverse();
					console.log(alias);
					if(!Ext.isEmpty(Ext.ClassManager.getNameByAlias(alias))){
						//custom component for type exists
						type = "search-result-"+group.name.toLowerCase();
					}


					//Refactor to just pas the hit model a
					result.push( {
						xtype: type,
						sortId: sortIndexes,
						hit: hit
					});
				},	this);

				//result = Ext.Array.sort(result, me.sortByRelevanceScore, me);

			}, this);
		}

		menu.removeAll(true);

		menu.add(results);
		//show results...
		menu.hide().show();
	},

	categoryNamesMap: {
		'content':'Books',
		'messageinfo':'Chats',
		'post':'Thoughts'
	},

	sanitizeCategoryName: function(n){
		var s = this.categoryNamesMap[n.toLowerCase()];
		return s||n;
	},

	sortByRelevanceScore: function(a, b){
		var aScore = a.hit.get('Score') || -Infinity,
			bScore = b.hit.get('Score') || -Infinity;

		return aScore - bScore;
	},

	sortSearchHits: function(aa,bb){

		function compareIndices(i, j){
			return i===j ? 0 : i < j ? -1: 1;
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
		s.proxy.extraParams = Ext.apply(s.proxy.extraParams||{},{
			sortOn: 'relevance',
			sortOrder: 'descending'
		});

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

	searchBlogResultClicked: function(result){
		var u = result.user,
			r = result.record,
			postId = r.get('ID'),
			title = 'Thoughts',
			hash, args=[title, postId];

		if(!postId || !Ext.isString(postId)){args.pop();}

		hash = u.getProfileUrl.apply(u,args);

		if(location.hash !== hash){
			location.hash = hash;
		}
	},

	searchResultClicked: function(result, fragIdx){
		var nav = this.getController('Navigation'),
			cid = result.hit.get('ContainerId'),
			cat = result.up('search-result-category').category,
			fragments, clickedFragment;

		if(fragIdx !== fragments){
			fragments = result.hit.get('Fragments');
			if(fragIdx >= 0 && fragIdx < fragments.length){
				clickedFragment = fragments[fragIdx];
			}
			else{
				console.warn('Bad fragment index', fragIdx, fragments);
			}
		}

		function success(obj){
			nav.navigate(cid, obj);
		}

		function failure(req, resp){
			var objDisplayType = (result.hit.get('Type') || 'object').toLowerCase(),
				msgCfg = { msg: 'An unexpected error occurred loading the '+ objDisplayType };

			if(resp && resp.status){
				if(resp.status === 404){
					msgCfg.title = 'Not Found!';
					msgCfg.msg = 'The '+objDisplayType+' you are looking for no longer exists.';
				}
				else if(resp.status === 403){
					msgCfg.title = 'Unauthorized!';
					msgCfg.msg = 'You do not have access to this '+objDisplayType+'.';
				}
			}
			console.log("Could not retrieve rawData for: ",result.hit.getId());
			console.log("Error: ", arguments);
			alert(msgCfg);
		}

		if (!cid) {
			console.error('No container ID taged on search result, cannot navigate.');
			return;
		}

		Ext.ComponentQuery.query('library-view-container')[0].activate();

		if(cat==='Books'){
			nav.navigateAndScrollToSearchHit(cid, result, clickedFragment);
			return;
		}

		$AppConfig.service.getObject(result.hit.getId(), success, failure);
	}
});
