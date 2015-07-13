Ext.define('NextThought.app.context.StateStore', {
	extend: 'NextThought.common.StateStore',

	setContext: function(context, title, route) {
		this.current_context = context;

		this.ANCHOR = this.ANCHOR || document.createElement('a');

		this.current_title = title;
		this.current_route = route;

		//make the href absolute;
		this.ANCHOR.href = '/' + route.replace(/^\//, '');

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


	getLocationInterface: function() {
		return this.ANCHOR.cloneNode();
	},


	getCurrentRoute: function() {
		return decodeURIComponent(this.ANCHOR.pathname);
	},


	getCurrentSearch: function() {
		return this.ANCHOR.search;
	},


	getCurrentHash: function() {
		return this.ANCHOR.hash;
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


	removeObjectRoute: function() {
		var location = this.getLocationInterface(),
			route = Globals.trimRoute(this.getCurrentRoute()),
			parts = route.split('/');

		if (parts[parts.length - 3] === 'object') {
			parts = parts.slice(0, -3);
		} else if (parts[parts.length - 2] === 'object') {
			parts = parts.slice(0, -2);
		}

		location.pathname = parts.join('/');

		route = decodeURIComponent(location.pathname);

		return route;
	}
});
