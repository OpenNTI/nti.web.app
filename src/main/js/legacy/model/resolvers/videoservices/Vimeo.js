const Ext = require('@nti/extjs');
const Globals = require('internal/legacy/util/Globals');
const BatchExecution = require('internal/legacy/util/BatchExecution');

const schedular = new BatchExecution({ batchSize: 5 });

const domain = global.location
	? ''
	: `&domain=${encodeURIComponent(global.location.hostname)}`;
const size = '&width=960';

module.exports = exports = Ext.define(
	'NextThought.model.resolvers.videoservices.Vimeo',
	{
		alias: 'resolvers.videoservices.vimeo',

		statics: {
			TYPE: 'vimeo',

			RESOLVED: {},

			//URL: '//vimeo.com/api/v2/video/{0}.json',
			URL: `https://vimeo.com/api/oembed.json?url=http%3A//vimeo.com/{0}${domain}${size}`,

			getVideo(id) {
				const url = Ext.String.format(this.URL, id);

				return fetch(url).then(r =>
					r.ok ? r.json() : Promise.reject(r)
				);
			},

			resolvePosterForID: function (id) {
				var cache = this.RESOLVED,
					url,
					promise;

				if (cache[id]) {
					return cache[id];
				}

				url = Ext.String.format(this.URL, id);

				promise = schedular.schedule(() =>
					fetch(url)
						.then(r => (r.ok ? r.json() : Promise.reject(r)))
						.then(o => o[0] || o)
						.then(function (json) {
							json.poster =
								json.thumbnail_large || json.thumbnail_url;
							json.thumbnail =
								json.thumbnail_medium || json.thumbnail_url;

							return json;
						})
						.catch(function (reason) {
							console.log(
								'Unable to resolve vimeo poster: ',
								reason
							);
							return {
								poster: Globals.CANVAS_BROKEN_IMAGE.src,
								thumbnail: Globals.CANVAS_BROKEN_IMAGE.src,
							};
						})
				);

				cache[id] = promise;

				return promise;
			},

			EMBED_URL: 'https://www.vimeo.com/{0}',

			getEmbedURL: function (url) {
				var id = this.getIdFromURL(url);

				return Ext.String.format(this.EMBED_URL, id);
			},

			ID_REGEX:
				/(?:https?:)?\/\/(?:(www|player)\.)?vimeo.com\/(?:(channels|video)\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/,

			//http://stackoverflow.com/questions/13286785/get-video-id-from-vimeo-url
			getIdFromURL: function (url) {
				var match = url.match(this.ID_REGEX);

				if (match && match[5]) {
					return match[5];
				}

				return null;
			},

			URL_MATCHES: /vimeo/,

			urlIsFor: function (url) {
				return this.URL_MATCHES.test(url);
			},
		},

		constructor: function (data) {
			var source = data.source;
			this.callParent(arguments);

			if (source.service !== 'vimeo') {
				Ext.Error.raise('Source Service Mismatch');
			}

			this.videoId = source.source[0];

			// //Vimeo sources only will have one 'source'.
			// this.source = Ext.String.format(this.URL, source.source[0]);
		},

		resolve: function () {
			return this.self.resolvePosterForID(this.videoId);
		},
	}
);
