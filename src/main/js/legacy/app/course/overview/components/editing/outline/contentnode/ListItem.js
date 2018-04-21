const Ext = require('@nti/extjs');

require('../calendarnode/ListItem');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.outline.contentnode.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.outline.calendarnode.ListItem',
	alias: 'widget.overview-editing-contentnode-listitem'
});
