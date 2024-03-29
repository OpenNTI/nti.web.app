const Ext = require('@nti/extjs');
const Globals = require('internal/legacy/util/Globals');
const ContextStateStore = require('internal/legacy/app/context/StateStore');
const UserSearch = require('internal/legacy/model/UserSearch');

require('internal/legacy/common/Actions');

module.exports = exports = Ext.define('NextThought.app.sharing.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.callParent(arguments);

		this.ContextStore = ContextStateStore.getInstance();
	},

	getSuggestionStore: function () {
		var store = new Ext.data.Store({
			model: 'NextThought.model.UserSearch',
		});

		this.__getSuggestionItems().then(function (items) {
			store.loadRecords(items);
			store.fireEvent('load');
		});

		return store;
	},

	__getSuggestionItems: function () {
		return Promise.all([
			this.getSuggestions(),
			this.getCommunities(),
			this.getGroups(),
		]).then(function (results) {
			var suggestions = results[0],
				communities = results[1],
				groups = results[2],
				data = [];

			if (suggestions && suggestions.length) {
				data.push(
					UserSearch.create({
						realname: 'Suggestions',
						isLabel: true,
					})
				);
				data = data.concat(suggestions);
			}

			if (communities && communities.length) {
				data.push(
					UserSearch.create({
						realname: 'Communities',
						isLabel: true,
					})
				);
				data = data.concat(communities);
			}

			if (groups && groups.length) {
				data.push(
					UserSearch.create({
						realname: 'Groups',
						isLabel: true,
					})
				);
				data = data.concat(groups);
			}

			return data;
		});
	},

	getSiteCommunity: function () {
		var siteId = Service.get('SiteCommunity');

		return Service.getCommunitiesList().then(function (communities) {
			communities = communities.filter(function (community) {
				return community.getId() === siteId;
			});

			if (communities[0]) {
				return UserSearch.create(communities[0].getData());
			}
		});
	},

	getSuggestions: function () {
		var suggestions = [this.getSiteCommunity()],
			context = this.ContextStore.getContext();

		(context || []).forEach(function (item) {
			if (item.obj && item.obj.getSuggestedSharing) {
				suggestions.push(item.obj.getSuggestedSharing());
			} else if (item.cmp && item.cmp.getSuggestedSharing) {
				suggestions.push(item.cmp.getSuggestedSharing());
			}
		});

		return Promise.all(suggestions).then(function (results) {
			results = Globals.flatten(results);

			return results.reduce(function (acc, result) {
				if (!result) {
					return acc;
				}

				if (result.isModel) {
					acc.push(result);
				} else if (result.suggestions && result.suggestions.length) {
					acc.push(
						UserSearch.create({
							realname: result.label,
							isLabel: true,
						})
					);
					acc = acc.concat(result.suggestions);
				}

				return acc;
			}, []);
		});
	},

	getCommunities: function () {
		var siteId = Service.get('SiteCommunity');

		return Service.getCommunitiesList().then(function (communities) {
			return communities
				.filter(function (community) {
					return (
						!community.isEveryone() && community.getId() !== siteId
					);
				})
				.map(function (community) {
					return UserSearch.create(community.getData());
				});
		});
	},

	getGroups: function () {
		return Service.getGroupsList().then(function (groups) {
			return groups.map(function (group) {
				return UserSearch.create(group.getData());
			});
		});
	},
});
