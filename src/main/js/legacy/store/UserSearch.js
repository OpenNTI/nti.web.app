var Ext = require('extjs');
var ProxyUserSearch = require('../proxy/UserSearch');
var GroupsStateStore = require('../app/groups/StateStore');
var {isMe} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.store.UserSearch', {
	extend: 'Ext.data.Store',
	model: 'NextThought.model.UserSearch',

	proxy: {
		type: 'usersearch',
		model: 'NextThought.model.UserSearch'
	},

	filters: [
		{ fn: function (rec) { return !isMe(rec); } },
		{ fn: function (rec) { return (!rec.isEveryone || !rec.isEveryone()); } }
	],

	sorters: [
		{sorterFn: function (a, b) {
			var list = this.contactsList, aa, bb;
			if (!this.contactsList || (new Date() - (this.lastUsed || 0)) > 0) {
				this.contactsList = list = NextThought.app.groups.StateStore.getInstance().getFriendsList().getContacts();
				this.lastUsed = new Date();
			}

			aa = Ext.Array.contains(list, a.getId());
			bb = Ext.Array.contains(list, b.getId());

			return aa === bb ? 0 : aa ? -1 : 1;
		}},
		{property: 'displayName', direction: 'DESC'}
	],

	minRemoteSearchLength: 3,

	search: function (q) {
		var query = q || '';

		if (query.length === 0) {
			this.removeAll();
		}
		else {
			this.load({
				params: {
					query: encodeURIComponent(query)
				}
			});
		}
	}
});
