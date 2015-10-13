Ext.define('NextThought.model.resolvers.videoservices.Kaltura', {
	statics: {
		URL_MATCHES: /kaltura:\/\/[^\/]+\/[^\/]+\/{0,1}/i,

		urlIsFor: function(url) {
			return this.URL_MATCHES.exec(url);
		}
	}
});
