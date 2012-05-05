Ext.define('NextThought.controller.Search', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.providers.Location',
		'NextThought.util.ViewUtils'
	],

	models: [
		'Hit'
	],

	stores: [
		'Hit'
	],

	views: [
		'Viewport',
		'form.fields.SearchField',
		'menus.Search',
		'menus.search.ResultCategory',
		'menus.search.Result',
		'menus.search.More'
	],

	refs: [
		{
			ref: 'viewport',
			selector: 'master-view'
		},
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
					title: loc.title.get('title'),
					section: loc.label,
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

		s.proxy.url = url.join('');
		s.on('load', Ext.bind(this.storeLoad, this, [value], true), this, {single: true});
		s.load();
	},


	clearSearchResults: function() {
		Ext.getCmp('search-results').removeAll(true);
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


	/*
	//pretend to get a search result and just stuff it into the results container for now
	pretendToFindSomethingAndPopulateMenu: function() {
		var c = Ext.getCmp('search-results');
		c.hide().show();
		c.add(
			[
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
		);
	}
	*/
});
