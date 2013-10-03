Ext.define('NextThought.model.converters.VideoSources', {
	override: 'Ext.data.Types',
	requires: [
		'Ext.data.SortTypes'
	],
	VIDEOSOURCES: {
		type: 'VideoSource',
		sortType: null,

		convert: function(v) {
			var i = v.length - 1, x,
				o, sources, types,
				newSource = [];

			for (i; i >= 0; i--) {
				o = v[i];

				if (o && o.service === 'html5') {

					sources = o.source;
					types = o.type;
					delete o.type;

					//has this already been converted?
					if (sources && sources[0] && Ext.isObject(sources[0])) {
						continue;
					}

					if (!types && sources && sources.length === 1) {
						o.source = [{source: sources[0]}];
						continue;
					}

					if (!sources || !types || sources.length !== types.length) {
						console.error('Bad Video Source!', Ext.clone(v));
						delete v[i];
						continue;
					}

					x = sources.length - 1;
					for (x; x >= 0; x--) {
						newSource[x] = {
							source: sources[x],
							type: types[x]
						};
					}

					o.source = newSource;
				}
			}

			//console.debug('Video Sources:',v);
			return v;
		}
	}
},function() {
	this.VIDEOSOURCES.sortType = Ext.data.SortTypes.none;
});

