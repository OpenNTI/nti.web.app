Ext.define('NextThought.mixins.Router', {
	mixins: {
		Path: 'NextThought.mixins.routing.Path',
		Object: 'NextThought.mixins.routing.Object'
	},

	initRouter: function() {
		this.mixins.Path.initRouter.call(this);
		this.mixins.Object.initRouter.call(this);
	},


	addChildRouter: function(cmp) {
		cmp.__parentRouter = this;

		this.mixins.Path.addChildRouter.call(this, cmp);
		// this.mixins.Object.addChildRouter.call(this, cmp);
	},


	__handleObjectNav: function(result) {
		result = result || {};

		if (typeof result === 'string') {
			result = {
				route: result
			}
		}

		this.pushRoute(result.title || '', result.route, result.precache);
	},


	__handleObjectRoute: function(result) {
		result = result || {};

		if (typeof result === 'string') {
			result = {
				route: result
			};
		}

		this.replaceRoute(result.title || '', result.route, result.precache);
	},


	__handleNoObjectNavigation: function(object) {
		if (this.__parentRouter) {
			this.__parentRouter.navigateToObject(object);
		}
	},


	navigateToObject: function(object) {
		return this.mixins.Object.handleObject.call(this, object)
			.then(this.__handleObjectNav.bind(this))
			.fail(this.__handleNoObjectNavigation.bind(this, object));
	},


	__handleNoObjectRoute: function(object) {
		var me = this,
			children = me.__childRouters || [];

		Promise.first(children.map(function(child) {
			if (child.handleObject) {
				return child.handleObject(object);
			}

			return Promise.reject();
		})).then(me.__handleObjectRoute.bind(me))
			.fail(function() {
					me.replaceRootState('', '/');
			});
	},


	handleObject: function(object) {
		this.mixins.Object.handleObject.call(this, object)
			.then(this.__handleObjectRoute.bind(this))
			.then(this.__handleNoObjectRoute.bind(this, object));
	}
});
