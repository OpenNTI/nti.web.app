const Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.model.resolvers.videoservices.Youtube', {
	alias: 'resolvers.videoservices.youtube',

	statics: {
		TYPE: 'youtube',

		//http://stackoverflow.com/questions/2068344/how-do-i-get-a-youtube-video-thumbnail-from-the-youtube-api
		POSTER_URL: '//img.youtube.com/vi/{0}/0.jpg',

		resolvePosterForID: function (id) {
			return Promise.resolve(Ext.String.format(this.POSTER_URL, id));
		},

		EMBED_URL: '//www.youtube.com/embed/{0}',

		getEmbedURL: function (url) {
			var id = this.getIdFromURL(url);

			return Ext.String.format(this.EMBED_URL, id);
		},

		//http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
		getIdFromURL: function (url) {
			var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/,
				match = url.match(regExp);

			if (match && match[2].length === 11) {
				return match[2];
			}
			return null;
		},

		URL_MATCHES: /youtu\.?be/,

		urlIsFor: function (url) {
			return this.URL_MATCHES.test(url);
		}
	},


	constructor: function (data) {
		var source = data.source;
		this.callParent(arguments);

		if (source.service !== 'youtube') {
			Ext.Error.raise('Source Service Missmatch');
		}

		this.videoId = source.source[0];
	},

	resolve () {
		return this.self.resolvePosterForID(this.videoId)
			.then((poster) => { return {poster, thumbnail: poster}; });
	}
});
