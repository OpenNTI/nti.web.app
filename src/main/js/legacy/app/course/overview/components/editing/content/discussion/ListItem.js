const Ext = require('extjs');

const DiscussionRef = require('legacy/model/DiscussionRef');

require('../../../parts/Discussion');
require('../ListItem');



module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.discussion.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-discussion-listitem',

	statics: {
		getSupported: function () {
			return DiscussionRef.mimeType;
		}
	},

	cls: 'overview-editing-listitem discussion',

	dropPlaceholderStyles: {
		side: 'left'
	},

	getPreviewType: function () {
		return 'course-overview-discussion';
	}
});
