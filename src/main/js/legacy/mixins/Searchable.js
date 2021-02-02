const Ext = require('@nti/extjs');

const SearchStateStore = require('legacy/app/search/StateStore');

require('./SearchHitHighlighting');


module.exports = exports = Ext.define('NextThought.mixins.Searchable', {
	mixins: {
		SearchHighlighting: 'NextThought.mixins.SearchHitHighlighting'
	},

	initSearch: function () {
		this.SearchStore = SearchStateStore.getInstance();
		this.searchId = this.getContainerIdForSearch();

		var search = this.SearchStore.getHitForContainer(this.searchId);

		if (search) {
			this.showSearch(search.hit, parseInt(search.fragment, 10) - 1);
		}
	},

	showSearch: function (hit, fragIdx) {
		var frags = hit.get('Fragments'),
			frag = frags && (frags[fragIdx || 0] || frags[0]);

		this.onceReadyForSearch()
			.then(this.showSearchHit.bind(this, hit, frag));
	},

	/**
	 * Return a promise that fulfills when then cmp is ready
	 * for the search results to be applied
	 * @override
	 * @returns {Promise} -
	 */
	onceReadyForSearch: function () {
		return Promise.resolve();
	},

	/**
	 * Return the NTIID of the thing to look for
	 * search results in
	 * @override
	 * @returns {string} NTIID
	 */
	getContainerIdForSearch: function () {},

	clearSearchHit: function () {
		this.SearchStore.clearHitForContainer(this.searchId);
		this.mixins.SearchHighlighting.clearSearchHit.call(this);
	}
});
