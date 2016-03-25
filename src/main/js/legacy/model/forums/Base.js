var Ext = require('extjs');
var StoreUtils = require('../../util/Store');
var SearchUtils = require('../../util/Search');
var ModelBase = require('../Base');
var UtilStore = require('../../util/Store');
var UserdataStateStore = require('../../app/userdata/StateStore');


module.exports = exports = Ext.define('NextThought.model.forums.Base', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'isGroupHeader', type: 'boolean', persist: false, defaultValue: false},
		{name: 'groupName', type: 'string', persist: false},
		//View only
		{name: 'matches', type: 'int', persist: false, defaultValue: 0},
		{name: 'searchTerm', type: 'string', persist: false, defaultValue: ''}
	],

	getContentsStoreId: function (prefix, suffix) {
		prefix = prefix || '';
		suffix = suffix || '';
		return prefix + this.get('Class') + '-' + this.get('NTIID') + suffix;
	},

	buildContentsStore: function (idSuffix, cfg, extraParams) {
		var store,
			UserDataStore = NextThought.app.userdata.StateStore.getInstance(),
			id = this.getContentsStoreId('', idSuffix);

		store = Ext.getStore(id);

		if (!store) {
			store = NextThought.store.NTI.create(Ext.apply({
				storeId: id,
				url: this.getLink('contents')
			}, cfg || {}));

			UserDataStore.addStore(store);
		}

		store.proxy.extraParams = Ext.apply(
			store.proxy.extraParams || {},
			Ext.apply({
				sortOn: 'createdTime',
				sortOrder: 'descending'
			}, extraParams));

		//Because the View is tied to the store and its events, any change to
		// records trigger a refresh. :)  So we don't have to impl. any special logic filling in. Just replace the
		// Creator string with the user model and presto!
		StoreUtils.fillInUsers(store);

		return store;
	},

	getParentHref: function () {
		var path = this.get('href');
		path = path.split('/');
		path.pop();
		return path.join('/');
	},

	getMatchCount: function (term) {
		if (!term) { return 0; }

		var me = this,
			re = SearchUtils.getRegExCache(term),
			count = 0, terms = me.searchProps || [];

		if (!re) { return 0; }

		function getMatches (val) {
			if (Ext.isString(val)) {
				count += (val.match(re) || []).length;
			} else if (Ext.isArray(val)) {
				val.forEach(function (v) {
					getMatches(v);
				});
			}
		}

		terms.forEach(function (prop) {
			var val = me.get(prop);

			getMatches(val);
		});

		return count;
	},

	setMatchCount: function (term) {
		var headline = this.get('headline'),
			count = 0;

		if (headline && term) {
			count += headline.getMatchCount(term);
		}

		this.set({
			'matches': count,
			'searchTerm': term
		});
	}
});
