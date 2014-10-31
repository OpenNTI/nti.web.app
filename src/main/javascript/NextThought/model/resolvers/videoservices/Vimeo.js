Ext.define('NextThought.model.resolvers.videoservices.Vimeo', {
	alias: 'resolvers.videoservices.vimeo',

	statics: {
		RESOLVED: {}
	},


	//URL: '//vimeo.com/api/v2/video/{0}.json',
	URL: '//vimeo.com/api/oembed.json?url=http%3A//vimeo.com/{0}',


	constructor: function(data) {
		var source = data.source;
		this.callParent(arguments);

		if (source.service !== 'vimeo') {
			Ext.Error.raise('Source Service Missmatch');
		}

		//Vimeo sources only will have one 'source'.
		this.source = Ext.String.format(this.URL, source.source[0]);
	},


	resolve: function() {
		var cache = this.self.RESOLVED,
			promise;

		if (cache[this.source]) {
			return cache[this.source];
		}


		promise = Service.request({url: this.source, withCredentials: false})
				.then(Ext.decode)
				.then(function(jsonArray) {return jsonArray[0];})
				.then(function(json) {
					json.poster = json.thumbnail_large;
					json.thumbnail = json.thumbnail_medium;
					return json;
				})
				.fail(function(reason) {
					console.log('Not able to resolve', reason);
					return {
						poster: Globals.CANVAS_BROKEN_IMAGE.src,
						thumbnail: Globals.CANVAS_BROKEN_IMAGE.src
					};
				});

		cache[this.source] = promise;
		return promise;
	}
});
