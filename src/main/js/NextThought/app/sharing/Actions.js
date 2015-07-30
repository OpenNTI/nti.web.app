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
					//TODO: insert label record
					data = data.concat(suggestions);
				}

				if (communities && communities.length) {
					//TODO: insert label record
					data = data.concat(communities);
				}

				if (groups && groups.length) {
					//TODO: insert label record
					data = data.concat(groups);
				}

				return data;
			});
	},


	getSiteCommunity: function() {},


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
		return [];
	},


	getGroups: function() {
		return [];
	}
});
