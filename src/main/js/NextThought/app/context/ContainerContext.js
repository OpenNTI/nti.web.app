Ext.define('NextThought.app.context.ContainerContext', {
	requires: [
		'NextThought.app.context.types.*'
	],

	constructor: function(config) {
		this.callParent(arguments);

		this.config = config;
		this.container = config.container;
	},

	/**
	 * Load the context of UserData (i.e. note)
	 * @param  {[string]} type [type of context: card, list, or leave empty.
	 *                          Leave empty, in case of a note will be presented in a note window
	 *                          'card': to be rendered as a card, @see notes in activity.
	 *                          'list': to be rendered as a list object, @see notes in profiles.]
	 * @return {[Promise]}   	[Promise that resolves with dom element for the context]
	 */
	load: function(type) {
		var url = Service.getObjectURL(this.container);
		debugger;
		if (!this.load_promise) {
			this.load_promise = Service.request({
				url: url ,
				headers: {
					Accept: '*/*'
				}
			})
				.then(this.__parseResponse.bind(this))
				.then(this.__parseContext.bind(this, type));
		}

		return this.load_promise;
	},


	__parseResponse: function(response) {
		var parse;

		return new Promise(function(fulfill) {
			parse = ParseUtils.parseItems(response)[0];
			fulfill(parse || Ext.decode(response, true));
		})
		.fail(function() {
			var xml = (new DOMParser()).parseFromString(response, 'text/xml');

			if (xml.querySelector('parsererror')) {
				return Promise.resolve('');
			}

			return xml;
		});
	},


	__parseContext: function(contextType, obj) {
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
			return handler.parse(obj, contextType);
		}

		console.error('No handler to get context from obj:', obj);
		return Promise.resolve(null);
	}
});
