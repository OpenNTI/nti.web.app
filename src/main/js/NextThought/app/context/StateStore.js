Ext.define('NextThought.app.context.StateStore', {
	extend: 'NextThought.common.StateStore',

	setContext: function(context, title, route) {
		this.current_context = context;

		this.ROUTE_PARTS = Globals.getURLParts(route);

		this.current_title = title;
		this.current_route = route;

		this.fireEvent('new-context');
	},


	setCurrentTitle: function(title) {
		this.current_title = title;
	},


	getContext: function() {
		return this.current_context || [];
	},


	getRootContext: function() {
		return this.current_context[this.current_context.length - 1];
	},


	getRootBundle: function() {
		var context = this.current_context,
			i, x;

		for (i = 0; i < context.length; i++) {
			x = context[i];

			if (x.obj && x.obj.isBundle) {
				return x.obj;
			}
		}
	},


	getReaderLocation: function() {
		var root = this.getRootContext(),
			cmp = root && root.cmp;

		if (cmp && cmp instanceof NextThought.app.content.content.Index) {
			return cmp.getLocation();
		}

		return null;
	},


	getCurrentRoute: function() {
		return this.ROUTE_PARTS.pathname;
	},


	getCurrentSearch: function() {
		return this.ROUTE_PARTS.search;
	},


	getCurrentHash: function() {
		return this.ROUTE_PARTS.hash;
	},


	getCurrentTitle: function() {
		return this.current_title;
	},


	getCurrentObjectId: function() {
		var parts = this.getCurrentObjectParts();

		return parts.id;
	},


	getCurrentObjectParts: function() {
		var route = Globals.trimRoute(this.getCurrentRoute()),
			parts = route.split('/'),
			objectParts = {};

		if (parts[parts.length - 2] === 'object') {
			objectParts.id = ParseUtils.decodeFromURI(parts.last());
		} else if (parts[parts.length - 3] === 'object') {
			objectParts.id = ParseUtils.decodeFromURI(parts.last());
			objectParts.mimeType = decodeURIComponent(parts[parts.length - 2]);
		}

		return objectParts;
	},


	removeObjectRoute: function(path) {
		var route = Globals.trimRoute(path || this.getCurrentRoute()),
			parts = route.split('/');

		if (parts[parts.length - 3] === 'object') {
			parts = parts.slice(0, -3);
		} else if (parts[parts.length - 2] === 'object') {
			parts = parts.slice(0, -2);
		}

		route = parts.join('/');

		return route;
	}
});
