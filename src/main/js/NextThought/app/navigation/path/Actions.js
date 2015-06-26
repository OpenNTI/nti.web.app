Ext.define('NextThought.app.navigation.path.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.navigation.path.StateStore',
		'NextThought.app.navigation.path.parts.Assignment',
		'NextThought.app.navigation.path.parts.Content',
		'NextThought.app.navigation.path.parts.Forums',
		'NextThought.app.navigation.path.parts.Profiles'
	],


	constructor: function() {
		this.callParent(arguments);

		this.PathStore = NextThought.app.navigation.path.StateStore.getInstance();

		this.buildHandlerMap();
	},


	buildHandlerMap: function() {
		var parts = NextThought.app.navigation.path.parts,
			keys = Object.keys(parts), handlers = {};

		keys.forEach(function(key) {
			var part = parts[key].create();

			if (part.addHandlers) {
				handlers = part.addHandlers(handlers);
			}
		});

		this.mimeToHandlers = handlers;
	},


	getPathToObject: function(obj) {
		var id = obj.get('NTIID'),
			cache = this.PathStore.getFromCache(id),
			handler = this.mimeToHandlers[obj.mimeType];

		if (cache) {
			return cache;
		}

		if (!handler) {
			console.error('No handler to get path to: ', obj);
			return Promise.reject('No Handler');
		}

		cache = handler(obj, this.getPathToObject.bind(this));

		cache.fail(this.PathStore.removeFromCache.bind(this.PathStore, id));

		return this.PathStore.setInCache(id, cache);
	}
});
