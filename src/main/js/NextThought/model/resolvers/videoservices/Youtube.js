Ext.define('NextThought.model.resolvers.videoservices.Youtube', {
	statics: {
		//http://stackoverflow.com/questions/2068344/how-do-i-get-a-youtube-video-thumbnail-from-the-youtube-api
		POSTER_URL: '//img.youtube.com/vi/{0}/0.jpg',

		resolvePosterForID: function(id) {
			return Promise.resolve(Ext.String.format(this.POSTER_URL, id));
		},


		isYoutubeVideo: function() {

		},

		//http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
		getIdFromURL: function(url) {
			var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&\?]*).*/,
				match = url.match(regExp);

			if (match && match[2].length === 11) {
				return match[2];
			}
			return null;
		},

		URL_MATCHES: /youtu\.?be/,

		urlIsFor: function(url) {
			return this.URL_MATCHES.test(url);
		}
	}
});
