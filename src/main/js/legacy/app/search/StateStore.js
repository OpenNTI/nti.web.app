const Ext = require('@nti/extjs');

require('legacy/common/StateStore');
require('legacy/store/Hit');


module.exports = exports = Ext.define('NextThought.app.search.StateStore', {
	extend: 'NextThought.common.StateStore',
	HIT_MAP: {},

	setSearchContext: function (val, silent, bundle, page) {
		this.BUNDLE = bundle;
		this.PAGE = page;
		this.TERM = val;

		if (!silent) {
			this.fireEvent('context-updated');
		}
	},

	getTerm: function () {
		return this.TERM;
	},

	getBundleLocation: function () {
		return this.BUNDLE;
	},

	getPageLocation: function () {
		return this.PAGE;
	},

	setHitForContainer: function (containerId, hit, frag) {
		this.HIT_MAP[containerId] = {
			hit: hit,
			fragment: frag
		};
	},

	getHitForContainer: function (containerId) {
		return this.HIT_MAP[containerId];
	},

	clearHitForContainer: function (containerId) {
		delete this.HIT_MAP[containerId];
	}
});
