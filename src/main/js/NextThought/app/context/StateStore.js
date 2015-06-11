Ext.define('NextThought.app.context.StateStore', {
	extend: 'NextThought.common.StateStore',

	setContext: function(context, title, route) {
		this.current_context = context;

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


	getCurrentRoute: function() {
		return this.current_route;
	},


	getCurrentTitle: function() {
		return this.current_title;
	},


	getCurrentObjectId: function() {
		var route = Globals.trimRoute(this.getCurrentRoute()),
			parts = route.split('/');

		if (parts[parts.length - 2] === 'object') {
			return ParseUtils.decodeFromURI(parts.last());
		}
	},


	removeObjectRoute: function() {
		var route = Globals.trimRoute(this.getCurrentRoute()),
			parts = route.split('/');

		if (parts[parts.length - 2] === 'object') {
			parts = parts.slice(0, -2)
		}

		return parts.join('/');
	}
});
