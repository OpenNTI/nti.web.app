const Ext = require('extjs');

const StoreUtils = require('legacy/util/Store');
const {getURL} = require('legacy/util/Globals');
const LoginStateStore = require('legacy/login/StateStore');
const lazy = require('legacy/util/lazy-require')
	.get('ContentStateStore', ()=> require('./StateStore'));

require('legacy/common/Actions');


module.exports = exports = Ext.define('NextThought.app.library.content.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.callParent(arguments);

		this.ContentStore = lazy.ContentStateStore.getInstance();
		this.LoginStore = LoginStateStore.getInstance();

		this.mon(this.ContentStore, 'do-load', () => this.loadContent());
	},

	loadContent: function () {
		var store = this.ContentStore;

		if (store.isLoading()) {
			return;
		}

		store.setLoading();

		return this.LoginStore.getService()
			.then((service) => {

				if (!service) {
					console.error('No Service document defined');
					return;
				}

				return Promise.all([
					this.setUpContentBundles((service.getCollection('VisibleContentBundles', 'ContentBundles') || {}).href)
				]);
			})
			.then(() => {
				store.setLoaded();
			});
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
