export default Ext.define('NextThought.app.context.ContainerContext', {
	requires: [
		'NextThought.app.context.types.*',
		'NextThought.app.context.components.AuthorizationContext'
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

		if (type === 'card' && isFeature('disable-context-in-activity')) {
			return Promise.reject();
		}

		return Service.request({
				url: url
			})
				.then(this.__parseResponse.bind(this))
				.then(this.__parseContext.bind(this, type))
				.fail(this.__handle403Response.bind(this));
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
			} else {
				handler = null;
			}
		}

		if (this.contextCmp && this.contextCmp.destroy) {
		    this.contextCmp.destroy();
		    delete this.contextCmp;
		}

		if (handler) {
			handler = handler.create(this.config);
			this.contextCmp = handler.parse(obj, contextType);
			return this.contextCmp;
		}

		console.error('No handler to get context from obj:', obj);
		return Promise.resolve(null);
	},


	__handle403Response: function(response) {
		var o = Ext.decode(response.responseText, true),
			status = response.status,
			req = response && response.request,
			originalURL = req && req.options && req.options.url;

		if (status === 403 && originalURL) {
			return this.requestForbiddenContext(originalURL);
		}

		return Promise.resolve();
	},


	requestForbiddenContext: function(url){
		if (!url) { return Promise.resolve(); }

		// Forbidden Context URL.
		url = url + '/@@forbidden_related_context';

		return Service.request(url)
					.then(function(resp) {
						var p = Ext.decode(resp, true);
							catalogEntry = p.Items && ParseUtils.parseItems(p.Items)[0];

						if (catalogEntry) {
							cmp = Ext.widget('context-authorization', {
										catalogEntry: catalogEntry
									});

							return cmp;
						}
					});
	}
});
