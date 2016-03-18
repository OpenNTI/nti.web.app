var Ext = require('extjs');
var DomUtils = require('../util/Dom');
var ConvertersVideoSources = require('./converters/VideoSources');


/*global DomUtils, ParseUtils */
module.exports = exports = Ext.define('NextThought.model.PlaylistItem', {
    extend: 'Ext.data.Model',
    idProperty: 'NTIID',

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
		{name: 'duration', type: 'Synthetic', persist: false,
			fn: function(r) {
				return '';
			}
		},
		{name: 'comments', type: 'int', defaultValue: 0},
		{name: 'poster', type: 'VideoPoster'},
		{name: 'thumbnail', type: 'VideoPoster'},
        {name: 'progress', type: 'string', persist: false},
        {name: 'slidedeck', type: 'string', persist: false},
		{name: 'label', type: 'string', persist: false}
	],

    statics: {
		// FIXME: This is a Hack since a playlistItem doesn't have to be a video.
		// So far we're using like so and we need to use this mimeType for routing
		mimeType: "application/vnd.nextthought.ntivideo",

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

		fromDom: function(dom, videoIndex) {
			function getParam(name) {
				var el = Ext.DomQuery.select('param[name="' + name + '"]', dom)[0];
				return el ? el.getAttribute('value') : null;
			}
			dom = Ext.getDom(dom);
			var i,
				frag = (dom.ownerDocument || document).createDocumentFragment(),
				el = Ext.get(dom),
				title = getParam('title'),
				videoIndexId = getParam('video-ntiid'),
				o = {
					'title': title,
					'sources': el.query('object[type$=videosource]').map(DomUtils.parseDomObject),
					'dom-clone': frag,
					'NTIID': dom.getAttribute('data-ntiid')
				},
				sourceComparator = function(a, b) {
					var c = 0, $a = a['attribute-data-priority'], $b = b['attribute-data-priority'];
					if ($a !== $b) {c = $a < $b ? -1 : 1;}
					return c;
				};

			if (videoIndexId && videoIndex) {
				Ext.apply(o, videoIndex[videoIndexId]);
			}

			frag.appendChild(dom.cloneNode(true));

			Ext.Array.sort(o.sources, sourceComparator);

			return this.create(o);
		},


		fromURL: function(url) {

			//http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
			function parseYoutubeIdOut(url) {
				var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&\?]*).*/,
						match = url.match(regExp);
				if (match && match[2].length === 11) {
					return match[2];
				}
				return null;
			}

			function parseVimeoId(url) {
				var regExp = /^.*vimeo(\:\/\/|\.com\/)(.+)/i,
					match = url.match(regExp);
				if (match && match[2]) {
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
				youtubeId = parseYoutubeIdOut(url),
				vimeoId = parseVimeoId(url);

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
					source: [youtubeId || vimeoId || url],
					service: youtubeId ? 'youtube' :
							 vimeoId ? 'vimeo' :
							'html5'
				};
			}

			return this.create({mediaId: guidGenerator(), sources: [source]});
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
			video = (frag && frag.querySelector('object[type$=ntivideo]')) || this.get('NTIID');

		return (video && video.getAttribute && video.getAttribute('data-ntiid')) || video;
	}
});
