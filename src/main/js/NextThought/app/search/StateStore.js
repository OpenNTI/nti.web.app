Ext.define('NextThought.app.search.StateStore', {
	extend: 'NextThought.common.StateStore',

	requires: ['NextThought.store.Hit'],

	HIT_MAP: {},

	setSearchContext: function(val, bundle, page) {
		this.BUNDLE = bundle;
		this.PAGE = page;
		this.TERM = val;

		this.fireEvent('context-updated');
	},


	getTerm: function() {
		return this.TERM;
	},


	getBundleLocation: function() {
		return this.BUNDLE;
	},


	getPageLocation: function() {
		return this.PAGE;
	},


	setHitForContainer: function(containerId, hit, frag) {
		this.HIT_MAP[containerId] = {
			hit: hit,
			fragment: frag
		};
	},


	getHitForContainer: function(containerId) {
		return this.HIT_MAP[containerId];
	},


	clearHitForContainer: function(containerId) {
		delete this.HIT_MAP[containerId];
	}
});
