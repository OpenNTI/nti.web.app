var Ext = require('extjs');
var ContentListItem = require('../ListItem');
var PartsTimeline = require('../../../parts/Timeline');
var ModelTimeline = require('../../../../../../../model/Timeline');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.timeline.ListItem', {
    extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
    alias: 'widget.overview-editing-timeline-listitem',

    statics: {
		getSupported: function() {
			return NextThought.model.Timeline.mimeType;
		}
	},

    getPreviewType: function() {
		return 'course-overview-ntitimeline';
	}
});
