var Ext = require('extjs');
var ModelBase = require('./Base');
var ResolversVideoPosters = require('./resolvers/VideoPosters');


const TRANSCRIPT_PURPOSE = 'normal';
const CAPTION_PURPOSE = 'captions';

module.exports = exports = Ext.define('NextThought.model.Video', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.ntivideo',

	statics: {
		mimeType: 'application/vnd.nextthought.ntivideo',
		refMimeType: 'application/vnd.nextthought.ntivideoref',


		getTranscripts (transcripts) {
			return (transcripts || []).filter(x => x.purpose === TRANSCRIPT_PURPOSE);
		},


		getCaptions (transcripts) {
			return (transcripts || []).filter(x => x.purpose === CAPTION_PURPOSE);
		}
	},

	idProperty: 'ntiid',

	fields: [
		{name: 'description', type: 'string'},
		{name: 'poster', type: 'string'},
		{name: 'subtitle', type: 'string'},
		{name: 'title', type: 'string'},
		{name: 'sources', type: 'auto'},
		{name: 'transcripts', type: 'auto'},
		{name: 'label', type: 'string'},
		{name: 'ntiid', type: 'string'}
	],

	getId: function () {
		return this.get('ntiid') || this.get('NTIID');
	},

	getTitle: function () {
		return this.get('label');
	},

	getPoster: function () {
		return Promise.resolve(this.get('poster'));
	},

	getIcon: function () {
		return this.getPoster();
	},

	__resolvePosterFromSource: function () {
		var sources = this.get('sources');

		return Promise.all(sources.map(function (source) {
			if (source.poster || source.thumbnail) {
				return {
					poster: source.poster,
					thumbnail: source.thumbnail
				};
			}

			return NextThought.model.resolvers.VideoPosters.resolveForSource(source);
		}));
	},

	resolveThumbnail: function () {
		var poster = this.get('poster');

		if (poster) {
			return Promise.resolve(poster);
		}

		return this.__resolvePosterFromSource()
			.then(function (posters) {
				var resolved = posters[0];

				return resolved.thumbnail || resolved.poster || resolved;
			});
	},

	shouldBeRoot: function () {
		return true;
	},


	getTranscripts () {
		const transcripts = this.get('transcripts');

		return transcripts.filter(x => x.purpose === TRANSCRIPT_PURPOSE);
	},


	getCaptions () {
		const transcripts = this.get('transcripts');

		return transcripts.filter(x => x.purpose === CAPTION_PURPOSE);
	}
});
