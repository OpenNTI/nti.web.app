const Ext = require('@nti/extjs');

const Video = require('legacy/model/Video');

require('../../../parts/Video');
require('../ListItem');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.video.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-video-listitem',

	statics: {
		getSupported: function () {
			return Video.mimeType;
		}
	},

	getPreviewType: function (record) {
		return 'course-overview-video';
	}
});
