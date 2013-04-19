
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
		'menus.search.BlogResult',
		'menus.search.ForumResult',
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
		this.listen({
			component:{
				'searchfield': {
					'search' : this.searchForValue,
					'clear-search' : this.clearSearchResults
				},
				'search-result' : {
					'click': this.searchResultClicked,
					'click-blog-result': this.searchBlogResultClicked
				},
				'search-more' : {
					//'click': this.showAllForCategoryClicked
				},
				'search-advanced-menu': {
					'changed': this.searchFilterChanged
				},

				'profile-blog-post' :{
					'ready': this.blogPostReady
				}
			}
		});

		this.getHitStore().on('beforeload', function(){
			this.getSearchResultsMenu().el.mask('Searching...');
		}, this);
	},

	mimeToXType: function(mime){
		if(Ext.isEmpty(mime)){
			return 'search-result';
		}

		mime = mime.replace('application/vnd.nextthought.', '');
		mime = mime.replace('.', '-');

		return 'search-result-'+mime;
	},


	componentConfigForHit: function(hit){
		var id = hit.get('ContainerId'),
			sortIndexes = LocationProvider.getSortIndexes(id),
			type ='search-result',
			xtype = this.mimeToXType(hit.get('MimeType'));

		sortIndexes.reverse();
		if(!Ext.isEmpty(Ext.ClassManager.getNameByAlias('widget.'+xtype))){
			//custom component for type exists
			type = xtype;
		}

		//Refactor to just pas the hit model a
		return {
			xtype: type,
			sortId: sortIndexes,
			hit: hit
		};
	},


	getSearchResultsMenu: function(){
		return Ext.getCmp('search-results');
	},


	storeLoad: function(store, records, success, opts, searchVal){
		var results = [], menu = this.getSearchResultsMenu(),
			resultGroups, result, loc, type, alias, me = this;

		menu.el.unmask();
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
				result = {xtype:'search-result-category', category: group.name, items:[]};
				results.push(result);
				result = result.items;

				Ext.each(group.children, function(hit){
					var cfg = this.componentConfigForHit(hit);
					result.push(cfg);
				},	this);

				//result = Ext.Array.sort(result, me.sortByRelevanceScore, me);

			}, this);
		}

		menu.removeAll(true);
		menu.add(results);

		//show results...
		menu.hide().show();
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
			], selectedMimeTypes = [], me = this;

		//clear old results from both store and search results.
		this.clearSearchResults();
		s.removeAll();

		s.clearFilter();
		if(filter){
			Ext.each( filter.value, function(item){
				var mt = item.value;
				if(mt){
					selectedMimeTypes.push(mt);
				}
			});
			s.filter([{filterFn: function(item) {
				return filter.test(item); }} ]);
		}
		s.proxy.url = url.join('');
		s.proxy.extraParams = Ext.apply(s.proxy.extraParams||{},{
			sortOn: 'relevance',
			sortOrder: 'descending',
			accept: selectedMimeTypes.join(',')
		});

		s.on('load', Ext.bind(this.storeLoad, this, [value], true), this, {single: true});
		s.load();
	},

	clearSearchResults: function() {
		this.getSearchResultsMenu().removeAll(true);
	},


	searchFilterChanged: function(menu) {
		var allItems = menu.query('menuitem'),
			Filter = NextThought.Filter,
			everything = menu.down('[isEverything]').checked,
			searchValue = this.getSearchField().getValue();

		this.doPartialSearch = menu.down('[doPartialSearch]').checked;
		this.modelFilter = new NextThought.FilterGroup(menu.getId(),NextThought.FilterGroup.OPERATION_UNION);

		Ext.each(allItems, function(item){
			var models = item.model;
			if ((everything || item.checked) && models) {
				Ext.Array.each(Ext.Array.from(models), function(m){
					this.modelFilter.addFilter(new Filter('MimeType', Filter.OPERATION_INCLUDE, 'application/vnd.nextthought.'+m));
				}, this);
			}
		}, this);

		this.searchForValue(searchValue);
	},


	fragmentWithIndex: function(hit, fragIdx){
		fragments = hit.get('Fragments');
		if(fragIdx >= 0 && fragIdx < fragments.length){
			return fragments[fragIdx];
		}

		console.warn('Bad fragment index', fragIdx, fragments);
		return null;
	},

	gotoBlog: function(){
		//Some kind of cross controller event we can use instead?
		var navController = this.getController('Navigation'),
			args = Array.prototype.slice.call(arguments);

		navController.gotoBlog.apply(navController, args);
	},

	searchBlogResultClicked: function(result, fragIdx, isComment){
		function clearCallback(){
			if(me.onReadyCallbacks){
				delete me.onReadyCallbacks[qStr];
			}
		}

		function onReady(cmp, params){
			var lookup = params.queryString;
			clearTimeout(onReady.timeoutTimer);
			clearCallback();
			cmp.showSearchHit(hit, frag);
		}

		var u = result.user,
			r = result.record,
			postId = r.get('ID'),
			hit = result.hit,
			frag = fragIdx !== undefined ? hit.get('Fragments')[fragIdx] : undefined,
			qStr = this.getHitStore().queryString,
			commentId;

		if(isComment){
			commentId = hit.get('ID');
		}

		if(qStr){
			if(!this.onReadyCallbacks){
				this.onReadyCallbacks = {};
			}
			this.onReadyCallbacks[qStr] = onReady;
			onReady.timeoutTimer = setInterval(clearCallback, 3000);
		}

		this.gotoBlog(u, postId, commentId, {queryString: qStr});
	},

	searchResultClicked: function(result, fragIdx){
		var nav = this.getController('Navigation'),
			cid = result.hit.get('ContainerId'),
			cat = result.up('search-result-category').category,
			fragments, clickedFragment;

		if(fragIdx !== undefined){
			clickedFragment = this.fragmentWithIndex(result.hit, fragIdx);
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

		nav.setView('library');
		if(cat==='Books'){
			nav.navigateAndScrollToSearchHit(cid, result, clickedFragment);
			return;
		}

		$AppConfig.service.getObject(result.hit.getId(), success, failure);
	},

	blogPostReady: function(cmp, params){
		var qStr = (params || {}).queryString,
			fn;

		if(qStr && this.onReadyCallbacks){
			fn = this.onReadyCallbacks[qStr];
			if(Ext.isFunction(fn)){
				Ext.callback(fn, this, arguments);
			}
		}
	}
});
