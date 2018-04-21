const Ext = require('@nti/extjs');

require('../calendarnode/Preview');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.outline.contentnode.Preview', {
	extend: 'NextThought.app.course.overview.components.editing.outline.calendarnode.Preview',
	alias: 'widget.overview-editing-outline-contentnode-preview',

	enablePublishControls: true,

	enableCalendarControls: true
});
