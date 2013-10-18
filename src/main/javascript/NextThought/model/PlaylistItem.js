/*jslint */
/*global DomUtils, ParseUtils */
Ext.define('NextThought.model.PlaylistItem', {
	extend: 'Ext.data.Model',

	requires: [
		'NextThought.model.converters.VideoSources'
	],

	fields: [
		{name: 'mediaId', type: 'string'},
		{name: 'start', type: 'float', defaultValue: 0.0},
		{name: 'end', type: 'float', defaultValue: -1.0},
		{name: 'sourceIndex', type: 'int', defaultValue: 0},
		{name: 'sources', type: 'VideoSources'},
		{name: 'dom-clone', type: 'auto'},
		{name: 'NTIID', type: 'string'},
		{name: 'transcripts', type: 'auto'},
		{name: 'title', type: 'string'},
		{name: 'description', type: 'string'},
		{name: 'section', type: 'string'},
		{name: 'diration', type: 'Synthetic', persist: false,
			fn: function(r) {
				return '';
			}
		},
		{name: 'comments', type: 'int', defaultValue: 0}
	],

	statics: {
		compareSources: function(a, b) {
			var i;
			if (Ext.isArray(a) && Ext.isArray(b)) {
				if (a.length !== b.length) {
					return false;
				}
				for (i = a.length - 1; i >= 0; i--) {
					if (Ext.isObject(a)) {
						return Ext.Object.equal(a, b);
					}

					if (a[i] !== b[i]) {
						return false;
					}
				}
				return true;
			}

			if (!Ext.isArray(a) && !Ext.isArray(b)) {
				return a === b;
			}

			return false;
		},

		fromDom: function(dom) {
			dom = Ext.getDom(dom);
			var i,
				frag = (dom.ownerDocument || document).createDocumentFragment(),
				el = Ext.get(dom),
				titleParam = el.down('param[name=title]'),
				title = titleParam && titleParam.getAttribute('value'),
				o = {
					'title': title,
					'sources': el.query('object[type$=videosource]'),
					'dom-clone': frag,
					'NTIID': dom.getAttribute('data-ntiid')
				},
				sourceComparator = function(a, b) {
					var c = 0, $a = a['attribute-data-priority'], $b = b['attribute-data-priority'];
					if ($a !== $b) {c = $a < $b ? -1 : 1;}
					return c;
				};

			for (i = 0; i < o.sources.length; i++) {
				o.sources[i] = (DomUtils.parseDomObject(o.sources[i]));
			}
			Ext.Array.sort(o.sources, sourceComparator);

			frag.appendChild(dom.cloneNode(true));

			return this.create(o);
		},


		fromURL: function(url){

			//http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
			function parseYoutubeIdOut(url) {
				var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&\?]*).*/,
						match = url.match(regExp);
				if (match && match[2].length === 11) {
					return match[2];
				}
				return null;
			}

			function parseKalturaInformation(url) {
				var kalturaRegex = /^kaltura:\/\/([^\/]+)\/([^\/]+)\/{0,1}/i,
						match = url.match(kalturaRegex);

				return match ? match[1] + ':' + match[2] : null;
			}

			var source,
				youtubeId = parseYoutubeIdOut(url);

			if (/^kaltura:/i.test(url)) {
				kalturaSource = parseKalturaInformation(url);
				if (!kalturaSource) {
					console.error('Kaltura video specified but did not resolve.', url);
				}
				source = {
					service: 'kaltura',
					source: kalturaSource
				};
			}
			else {
				source = {
					service: youtubeId ? 'youtube' : 'html5',
					source: [youtubeId || url]
				};
			}

			return this.create({mediaId: guidGenerator(), sources:[source]});
		}
	},


	usesService: function(service) {
		return Ext.Array.contains(
				Ext.Array.pluck(this.get('sources'), 'service'),
				service);
	},


	getSources: function(service) {
		var i = [];
		Ext.each(this.data.sources, function(o) {
			if (!service || (o && service === o.service)) {
				i.push(o.source);
			}
		});
		return i;
	},

	activeSource: function() {
		return this.data.sources[this.data.sourceIndex];
	},

	useNextSource: function() {
		if (this.data.sourceIndex + 1 < this.data.sources.length) {
			this.data.sourceIndex += 1;
			return true;
		}
		return false;
	},

	nextSource: function() {},


	getAssociatedVideoId: function() {
		var frag = this.get('dom-clone'),
			video = frag.querySelector('object[type$=ntivideo]');

		return video && video.getAttribute('data-ntiid');
	}





});
