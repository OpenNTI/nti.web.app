Ext.define('NextThought.app.search.StateStore', {
	extend: 'NextThought.common.StateStore',

	requires: ['NextThought.store.Hit'],

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
	}
});
