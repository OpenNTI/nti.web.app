Ext.define('NextThought.mixins.Searchable', {

	mixins: {
		SearchHighlighting: 'NextThought.mixins.SearchHitHighlighting'
	},


	requires: [
		'NextThought.app.search.StateStore'
	],


	initSearch: function() {
		this.SearchStore = NextThought.app.search.StateStore.getInstance();
		this.searchId = this.getContainerIdForSearch();

		var search = this.SearchStore.getHitForContainer(this.searchId);

		if (search) {
			this.showSearch(search.hit, parseInt(search.fragment, 10) - 1);
		}
	},


	showSearch: function(hit, fragIdx) {
		var frags = hit.get('Fragments'),
			frag = frags && (frags[fragIdx || 0] || frags[0]);

		this.onceReadyForSearch()
			.then(this.showSearchHit.bind(this, hit, frag));
	},


	/**
	 * Return a promise that fulfills when then cmp is ready
	 * for the search results to be applied
	 * @override
	 * @return {Promise}
	 */
	onceReadyForSearch: function() {
		return Promise.resolve();
	},


	/**
	 * Return the NTIID of the thing to look for
	 * search results in
	 * @override
	 * @return {String} NTIID
	 */
	getContainerIdForSearch: function() {},


	clearSearchHit: function() {
		this.SearchStore.clearHitForContainer(this.searchId);
		this.mixins.SearchHighlighting.clearSearchHit.call(this);
	}
});
