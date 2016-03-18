var Ext = require('extjs');
var ContentListItem = require('../ListItem');
var PartsVideo = require('../../../parts/Video');
var ModelVideo = require('../../../../../../../model/Video');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.video.ListItem', {
    extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
    alias: 'widget.overview-editing-video-listitem',

    statics: {
		getSupported: function() {
			return NextThought.model.Video.mimeType;
		}
	},

    getPreviewType: function(record) {
		return 'course-overview-video';
	}
});
