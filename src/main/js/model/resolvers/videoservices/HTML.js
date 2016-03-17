export default Ext.define('NextThought.model.resolvers.videoservices.HTML', {
	statics: {
		TYPE: 'html5',

		URL_MATCHES: /^(http:\/\/|https:\/\/|\/\/).*/i,

		urlIsFor: function(url) {
			return this.URL_MATCHES.test(url);
		},

		getEmbedURL: function(raw) {
			return raw;
		},


		getIdFromURL: function(raw) {
			return raw;
		}
	}
});
