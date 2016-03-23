var Ext = require('extjs');
var ContentListItem = require('../ListItem');
var PartsVideoRoll = require('../../../parts/VideoRoll');
var ModelVideoRoll = require('../../../../../../../model/VideoRoll');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.videoroll.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-videoroll-listitem',

	statics: {
		getSupported: function() {
			return NextThought.model.VideoRoll.mimeType;
		}
	},

	getPreviewType: function(record) {
		return 'course-overview-videoroll';
	}
});
