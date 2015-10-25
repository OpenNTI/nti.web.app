Ext.define('NextThought.model.resolvers.videoservices.Kaltura', {
	statics: {
		type: 'kaltura',

		URL_MATCHES: /kaltura:\/\/[^\/]+\/[^\/]+\/{0,1}/i,

		urlIsFor: function(url) {
			return this.URL_MATCHES.exec(url);
		},


		getEmbedURL: function(raw) {
			return raw;
		},


		getIdFromURL: function(raw) {
			return raw;
		}
	}
});
