Ext.define('NextThought.app.sharing.Actions', {
	extend: 'NextThought.common.Actions',

	requires: ['NextThought.app.context.StateStore'],

	constructor: function() {
		this.callParent(arguments);

		this.ContextStore = NextThought.app.context.StateStore.getInstance();
	},


	getSuggestionStore: function() {
		var store = new Ext.data.Store({
				model: 'NextThought.model.UserSearch'
			});

		this.__getSuggestionItems()
			.then(function(items) {
				store.loadRecords(items);
				store.fireEvent('load');
			});

		return store;
	},

	__getSuggestionItems: function() {
		return Promise.all([
				this.getSuggestions(),
				this.getCommunities(),
				this.getGroups()
			]).then(function(results) {
				var suggestions = results[0],
					communities = results[1],
					groups = results[2],
					data = [];

				if (suggestions && suggestions.length) {
					data.push(NextThought.model.UserSearch.create({
						realname: 'Suggestions',
						isLabel: true
					}));
					data = data.concat(suggestions);
				}

				if (communities && communities.length) {
					data.push(NextThought.model.UserSearch.create({
						realname: 'Communities',
						isLabel: true
					}));
					data = data.concat(communities);
				}

				if (groups && groups.length) {
					data.push(NextThought.model.UserSearch.create({
						realname: 'Groups',
						isLabel: true
					}));
					data = data.concat(groups);
				}

				return data;
			});
	},


	getSiteCommunity: function() {
		var siteId = Service.get('SiteCommunity'), i,
			memberships = $AppConfig.userObject.get('DynamicMemberships');

		for (i = 0; i < memberships.length; i++) {
			if (memberships[i].getId && memberships[i].getId() === siteId) {
				return NextThought.model.UserSearch.create(memberships[i].asJSON());
			}
		}
	},


	getSuggestions: function() {
		var suggestions = [this.getSiteCommunity()],
			rootBundle = this.ContextStore.getRootBundle(),
			context = this.ContextStore.getContext();

		(context || []).forEach(function(item) {
			if (item.obj && item.obj.getSuggestedSharing) {
				suggestions.push(item.obj.getSuggestedSharing());
			}
		});

		return Promise.all(suggestions)
			.then(function(results) {
				results = Globals.flatten(results);

				return results.reduce(function(acc, result) {
					if (!result) { return acc; }

					if (result.isModel) {
						acc.push(result);
					} else if (result.suggestions && result.suggestions.length) {
						acc.push(NextThought.model.UserSearch.create({
							realname: result.label,
							isLabel: true
						}));
						acc = acc.concat(result.suggestions);
					}

					return acc;
				}, []);
			});
	},


	getCommunities: function() {
		var memberships = $AppConfig.userObject.get('DynamicMemberships'),
			siteId = Service.get('SiteCommunity');

		return memberships.filter(function(membership) {
			var id = membership.getId();

			return membership instanceof NextThought.model.Community && !membership.isEveryone() && id !== siteId && membership.getLink('Activity');
		}).map(function(membership) {
			return NextThought.model.UserSearch.create(membership.asJSON());
		});
	},


	getGroups: function() {
		var memberships = $AppConfig.userObject.get('DynamicMemberships');

		return memberships.filter(function(membership) {
			return membership instanceof NextThought.model.FriendsList;
		}).map(function(membership) {
			return NextThought.model.UserSearch.create(membership.asJSON());
		});
	}
});
