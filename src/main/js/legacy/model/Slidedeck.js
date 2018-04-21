const Ext = require('@nti/extjs');

require('./Base');


module.exports = exports = Ext.define('NextThought.model.Slidedeck', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.ntislidedeck',

	statics: {
		mimeType: 'application/vnd.nextthought.ntislidedeck'
	},
	idProperty: 'ID',
	fields: [
		{ name: 'Creator', type: 'string'},
		{ name: 'Slides', type: 'auto', defaultValue: []},
		{ name: 'Videos', type: 'auto', defaultValue: []},
		{ name: 'title', type: 'string'},
		{ name: 'DCDescription', type: 'string' },
		{ name: 'DCTitle', type: 'string' },
		{ name: 'description', type: 'string' },
		{ name: 'href', type: 'string'}
	],

	containsSlide: function (slide) {
		var slides = this.get('Slides') || [],
			slideId = slide && slide.isModel ? slide.getId() : slide,
			result = false;

		Ext.each(slides, function (o) {
			if (o.NTIID === slideId) {
				result = true;
				return false;
			}
		});

		return result;
	},


	containsVideo: function (videoId) {
		var videos = this.get('Videos') || [],
			result = false;

		Ext.each(videos, function (video) {
			if (video.NTIID === videoId || video.video_ntiid === videoId) {
				result = true;
				return false;
			}
		});

		return result;
	}
});
