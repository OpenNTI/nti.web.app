Ext.define('NextThought.util.Store', {
	singleton: true,

	fillInUsers: function fillIn(store, records) {

		if (store && arguments.length === 1) {
			store.on({'load': fillIn});
			return;
		}

		//work around ExtJS bug (the bug is fixed in 4.2.1)
		if (records && records.isStore) {
			records = records.getRange();
		}

		records = records || [];

		var users = records.map(function(r) {return r.get('Creator');});

		function apply(r, i) {
			var u = users[i],
					id = u.getId(),
					c = r.get('Creator');

			if (c !== id && !Ext.isString(c) && c && c.getId() !== id) {
				console.error('Bad mapping:', c, id, records, users, i);
				return;
			}

			if (c && !c.isModel) {
				r.set('Creator', u);
			}
		}

		UserRepository.getUser(users, function(u) {
			users = u;

			store.suspendEvents(true);
			records.forEach(apply);
			store.resumeEvents();

		});
	},



	newView: function(store) {
		if (Ext.isString(store)) {
			store = Ext.getStore(store);
		}

		var copy = new Ext.data.Store({
			proxy: 'memory',
			model: store.model,
			sorters: store.sorters.getRange(),
			filters: store.filters.getRange(),
			data: store.getRange()
		});

		function refilter() {
			var f = copy.filters.getRange();
			copy.clearFilter();
			copy.removeAll();
			copy.add(store.getRange());
			copy.filter(f.concat(store.filters.getRange()));
			copy.sort();
		}

		//probably a more efficient way exists...
		copy.mon(store, {datachanged: refilter, refilter: refilter});

		return copy;

	},

	loadRawItems: function(url, queryParams) {
		var queryString = queryParams && Ext.Object.toQueryString(queryParams),
			a = document.createElement('a');

		a.setAttribute('href', getURL(url));
		a.search = queryString || '';

		return Service.request(a.href);
	},

	/**
	 * A helper method for when we don't need a full store, to just load the items
	 * from a url
	 *
	 * @param  {String} url         the url to load
	 * @param  {Object} queryParams query params to attach
	 * @param  {String} itemProp 	the item prop to parse off of the response
	 * @return {Promise}            fulfills with the parsed items from the response
	 */
	loadItems: function(url, queryParams, itemProp) {
		itemProp = itemProp || 'Items';

		return this.loadRawItems(url, queryParams)
			.then(function(response) {
				var json = Ext.decode(response, true) || [];

				return ParseUtils.parseItems(json[itemProp]);
			});
	}


}, function() {
	window.StoreUtils = this;
});
