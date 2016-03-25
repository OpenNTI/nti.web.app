var Ext = require('extjs');
var ResolversVideoPosters = require('../resolvers/VideoPosters');


module.exports = exports = Ext.define('NextThought.model.converters.VideoSources', {
	override: 'Ext.data.Types',

	VIDEOSOURCES: {
		type: 'VideoSource',
		sortType: null,

		convert: function (v) {
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
	},

	VIDEOPOSTER: {
		type: 'VideoPoster',
		sortType: null,
		convert: function (v, r, source) {
			var name = this.mapping || this.name, len, x, s,
				raw = r && r.raw,
				resolver = NextThought.model.resolvers.VideoPosters;

			if (v && Ext.isString(v)) {//if we already have a value, done.
				return v;
			}

			if (raw && raw.sources && !source) {//no value, try to find it on the sources (not in recursive state)
				len = raw.sources.length || 0;
				for (x = 0; !v && x < len; x++) {
					s = raw.sources[x] || {};
					v = this.convert(s[name], r, s);
				}
			}

			if (!v && source) { //still didn't find it, and we are recusing on a source
				v = Ext.BLANK_IMAGE_URL;//stop iteration on caller and let the async resolver replace this value as soon as it resolves.

				resolver.resolveForSource(source)
						.then(function (data) {
							r.set(name, data[name]);
							if (name === 'poster') {
								wait(1).then(function () {
									r.fireEvent('resolved-poster', r);
								});
							}
						});
			} else {
				wait().then(r.fireEvent.bind(r, 'resolved-poster', r));
			}

			return v;
		}
	}
},function () {
	this.VIDEOSOURCES.sortType = Ext.data.SortTypes.none;
	this.VIDEOPOSTER.sortType = Ext.data.SortTypes.none;
});

