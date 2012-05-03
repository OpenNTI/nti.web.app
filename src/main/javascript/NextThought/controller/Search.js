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
		'menus.Search'
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
				'click': this.fakeSearchResultClicked
			}
		},{});
	},


	//TODO - refactor for new code....
	searchResultClicked: function(hit, searchValue) {
		var me = this,
			service = $AppConfig.service,
			containerId = hit.get('ContainerId');

		function success(o) {

			function sc(a){
				//these have to be resolved after navigation
				var cid = hit.get('ContainerId'),
					id = IdCache.hasIdentifier(hit.getId())
							? IdCache.getComponentId(hit.getId(),null,'default')
							: IdCache.hasIdentifier(cid)
								? IdCache.getComponentId(cid,null,'default')
								: null;
				//there's no id, meaning it's probably not user generated
				if (!id) {
					setTimeout(function(){ a.scrollToText(searchValue); },500);
				}
				else {
					setTimeout(function(){ a.scrollToId(id); },500);
				}

			}

			var r = Ext.getCmp('reader');


			Ext.getBody().unmask();
			if(!o){
				alert("bad things");
				return;
			}

			r.activate();

			if(LocationProvider.currentNTIID !== o.NTIID){
				LocationProvider.setLocation(o.NTIID, sc);
			}
			else {
				sc(r.down('reader-panel'));
			}
		}

		function failure(){
			Ext.getBody().unmask();
			service.getObject(hit.getId(),
				function success(o){ ViewUtils.displayModel(o); },
				function fail(){
					console.error(
							'error resolving container ', Ext.encode(hit.data),
							'Error resolving object: ', arguments);
				},
				this);
		}

		Ext.getBody().mask("Loading...");
		service.resolveTopContainer(containerId, success, failure);
	},


	storeLoad: function(store, records, success, opts){
		if (!success) {
			console.error('Store did not load correctly!, Do something, no results???');
			return;
		}

		console.log('yay, store loaded, got', records);
	},


 	searchForValue: function(value) {
		if(!value || value.length < 4){return;}

		var s = this.getHitStore(),
			url = $AppConfig.server.host + $AppConfig.server.data + 'Search/' + value;

		console.log('search for', value);

		this.clearSearchResults();
		if(/factor/i.test(value)){
			this.pretendToFindSomethingAndPopulateMenu();
		}

		/*
		s.proxy.url = url;
		s.on('load', this.storeLoad);
		s.load();
		*/
	},


	clearSearchResults: function() {
		Ext.getCmp('search-results').removeAll();
	},


	//someone clicked on a stupid fake result, just randomly navigate
	fakeSearchResultClicked: function(){
		var locations = [
			'tag:nextthought.com,2011-10:AOPS-HTML-prealgebra.0',
			'tag:nextthought.com,2011-10:AOPS-HTML-prealgebra.34',
			'tag:nextthought.com,2011-10:MN-HTML-MiladyCosmetology.1'
		];

		Ext.ComponentQuery.query('library-view-container')[0].activate();
		LocationProvider.setLocation( locations[Ext.Number.randomInt(0, 2)] );
	},


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
});
