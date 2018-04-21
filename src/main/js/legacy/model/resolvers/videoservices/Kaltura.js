const Ext = require('@nti/extjs');

const Globals = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.model.resolvers.videoservices.Kaltura', {
	alias: 'resolvers.videoservices.kaltura',

	statics: {
		TYPE: 'kaltura',

		URL_MATCHES: /kaltura:\/\/[^/]+\/[^/]+\/{0,1}/i,

		urlIsFor: function (url) {
			return this.URL_MATCHES.exec(url);
		},


		getEmbedURL: function (raw) {
			return raw;
		},


		getIdFromURL: function (raw) {
			return raw.replace('kaltura://', '').replace('/', ':');
		},


		resolvePosterForID (id) {
			if (!id) {
				return Promise.resolve({
					poster: Globals.CANVAS_BROKEN_IMAGE.src,
					thumbnail: Globals.CANVAS_BROKEN_IMAGE.src
				});
			}

			const [partnerId, videoId] = id.split(/[/:]/);
			const w = 1280;

			const poster = `//www.kaltura.com/p/${partnerId}/thumbnail/entry_id/${videoId}/width/${w}/`;

			return Promise.resolve({
				poster,
				thumbnail: poster
			});
		}
	},


	constructor (data) {
		this.callParent(data);

		const {source} = data || {};

		this.sources = source.source;
	},


	resolve () {
		const id = (this.sources || [])[0];

		return this.self.resolvePosterForID(id);
	}
});
