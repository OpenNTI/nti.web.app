Ext.define('NextThought.app.context.ContainerContext', {
	requires: [
		'NextThought.app.context.types.*'
	],

	constructor: function(config) {
		this.callParent(arguments);

		this.config = config;
		this.container = config.container;
	},


	load: function() {
		var url = Service.getObjectURL(this.container);

		if (!this.load_promise) {
			this.load_promise = Service.request({
				url: url,
				headers: {
					Accept: '*/*'
				}
			})
				.then(this.__parseResponse.bind(this))
				.then(this.__parseContext.bind(this));
		}

		return this.load_promise;
	},


	__parseResponse: function(response) {
		var parse;

		return new Promise(function(fufill) {
			return ParseUtils.parseItems(response)[0];
		})
		.fail(function() {
			var xml = (new DOMParser()).parseFromString(response, 'text/xml');

			if (xml.querySelector('parsererror')) {
				return Promise.resolve('');
			}

			return xml;
		});
	},


	__parseContext: function(obj) {
		var typesPath = NextThought.app.context.types,
			keys = Object.keys(typesPath), i, handler;

		for (i = 0; i < keys.length; i++) {
			handler = typesPath[keys[i]];
			if (handler.canHandle && handler.canHandle(obj)) {
				break;
			}
		}

		if (handler) {
			handler = handler.create(this.config);
			return handler.parse(obj);
		}

		console.error('No handler to get context from obj:', obj);
		return Promise.resolve(null);
	}
});
