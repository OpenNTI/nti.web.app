const Ext = require('@nti/extjs');

const Timeline = require('legacy/model/Timeline');

require('../../../parts/Timeline');
require('../ListItem');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.timeline.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-timeline-listitem',

	statics: {
		getSupported: function () {
			return Timeline.mimeType;
		}
	},

	getPreviewType: function () {
		return 'course-overview-ntitimeline';
	}
});
