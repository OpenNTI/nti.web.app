Ext.define('NextThought.model.resolvers.videoservices.HTML', {
	statics: {
		URL_MATCHES: /^(http:\/\/|https:\/\/|\/\/).*/i,

		urlIsFor: function(url) {
			return this.URL_MATCHES.test(url);
		}
	}
});
