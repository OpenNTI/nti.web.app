const Ext = require('@nti/extjs');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);
const { isFeature } = require('internal/legacy/util/Globals');

require('./types/Content');
require('./types/Poll');
require('./types/Question');
require('./types/RelatedWork');
require('./types/Slide');
require('./types/Video');
require('./types/LTIExternalToolAsset');
require('./components/AuthorizationContext');

module.exports = exports = Ext.define(
	'NextThought.app.context.ContainerContext',
	{
		constructor: function (config) {
			this.callParent(arguments);

			this.config = config;
			this.container = config.container;
		},

		/**
		 * Load the context of UserData (i.e. note)
		 * @param  {[string]} type [type of context: card, list, or leave empty.
		 *							Leave empty, in case of a note will be presented in a note window
		 *							'card': to be rendered as a card, @see notes in activity.
		 *							'list': to be rendered as a list object, @see notes in profiles.]
		 * @returns {[Promise]}		[Promise that resolves with dom element for the context]
		 */
		load: function (type) {
			var url = Service.getObjectURL(this.container);

			if (type === 'card' && isFeature('disable-context-in-activity')) {
				return Promise.reject();
			}

			return Service.request({
				url: url,
			})
				.then(this.__parseResponse.bind(this))
				.then(this.__parseContext.bind(this, type))
				.catch(this.__handle403Response.bind(this));
		},

		__parseResponse: function (response) {
			var parse;

			return new Promise(function (fulfill) {
				parse = lazy.ParseUtils.parseItems(response)[0];
				fulfill(parse || Ext.decode(response, true));
			}).catch(function () {
				var xml = new DOMParser().parseFromString(response, 'text/xml');

				if (xml.querySelector('parsererror')) {
					return Promise.resolve('');
				}

				return xml;
			});
		},

		__parseContext: function (contextType, obj) {
			//This should be rewritten to create an array at the top of the file instead
			//Tof using the "Magic" ExtJS class namespace object...
			//eslint-disable-next-line no-undef
			const typesPath = NextThought.app.context.types;
			const keys = Object.keys(typesPath);

			let handler;

			for (let i = 0; i < keys.length; i++) {
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

		__handle403Response: function (response) {
			const status = response.status;
			const req = response && response.request;
			const originalURL = req && req.options && req.options.url;

			if (status === 403 && originalURL) {
				return this.requestForbiddenContext(originalURL);
			}

			return Promise.resolve();
		},

		requestForbiddenContext: function (url) {
			if (!url) {
				return Promise.resolve();
			}

			// Forbidden Context URL.
			url = url + '/@@forbidden_related_context';

			return Service.request(url).then(function (resp) {
				let p = Ext.decode(resp, true);
				let catalogEntry =
					p.Items && lazy.ParseUtils.parseItems(p.Items)[0];

				if (catalogEntry) {
					let cmp = Ext.widget('context-authorization', {
						catalogEntry: catalogEntry,
					});

					return cmp;
				}
			});
		},
	}
);
