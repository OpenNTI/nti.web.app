const Ext = require('@nti/extjs');
const {
	Models: {
		media: {
			MetaDataResolver: {
				services: { wistia: WistiaMetaDataResolver },
			},
			Providers: { WistiaProvider },
		},
	},
} = require('@nti/lib-interfaces');

module.exports = exports = Ext.define(
	'NextThought.model.resolvers.videoservices.Wistia',
	{
		alias: 'resolvers.videoservices.wistia',

		statics: {
			TYPE: 'wistia',

			RESOLVED: {},

			getIdFromURL(url) {
				return WistiaProvider.getID(url) || null;
			},

			async resolvePosterForID(id) {
				if (this.RESOLVED[id]) {
					return this.RESOLVED[id];
				}

				const source = { source: id };

				const data = await WistiaMetaDataResolver.resolve(
					'wistia',
					source
				);

				return {
					poster: data.poster,
					thumbnail: data.thumbnail,
				};
			},
		},

		constructor: function (data) {
			var source = data.source;
			this.callParent(arguments);

			if (source.service !== 'wistia') {
				Ext.Error.raise('Source Service Missmatch');
			}

			this.videoId = source.source[0];
		},

		resolve() {
			return this.self.resolvePosterForID(this.videoId);
		},
	}
);
