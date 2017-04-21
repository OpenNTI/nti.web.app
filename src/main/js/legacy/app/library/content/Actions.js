var Ext = require('extjs');
var StoreUtils = require('../../../util/Store');
var CommonActions = require('../../../common/Actions');
var ContentStateStore = require('./StateStore');
var {getURL} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.app.library.content.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.callParent(arguments);

		this.ContentStore = NextThought.app.library.content.StateStore.getInstance();
	},

	loadContent: function (service) {
		var store = this.ContentStore;

		if (!service) {
			console.error('No Service document defined');
			return;
		}

		store.setLoading();

		return Promise.all([
			this.setUpContentBundles((service.getCollection('VisibleContentBundles', 'ContentBundles') || {}).href)
		]);
	},

	setUpContentPackages: function (link) {
		if (!link) {
			this.ContentStore.setContentPackages([]);

			return Promise.resolve();
		}

		return StoreUtils.loadItems(getURL(link), null, 'titles')
			.then(this.ContentStore.setContentPackages.bind(this.ContentStore));
	},

	setUpContentBundles: function (link) {
		if (!link) {
			this.ContentStore.setContentBundles([]);

			return Promise.resolve();
		}

		return StoreUtils.loadItems(getURL(link), null, 'titles')
			.then(this.ContentStore.setContentBundles.bind(this.ContentStore));
	},

	findContent: function (id) {
		return this.ContentStore.onceLoaded()
			.then(this.ContentStore.findContent.bind(this.ContentStore, id));
	},

	findContentByPriority: function (fn) {
		return this.ContentStore.onceLoaded()
			.then(this.ContentStore.findContentByPriority.bind(this.ContentStore, fn));
	},

	findForNTIID: function (id) {
		return this.ContentStore.onceLoaded()
			.then(this.ContentStore.findForNTIID.bind(this.ContentStore, id));
	}
});
