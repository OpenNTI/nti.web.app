var Ext = require('extjs');
var ContentListItem = require('../ListItem');
var PartsDiscussion = require('../../../parts/Discussion');
var ModelDiscussionRef = require('../../../../../../../model/DiscussionRef');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.discussion.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-discussion-listitem',

	statics: {
		getSupported: function() {
			return NextThought.model.DiscussionRef.mimeType;
		}
	},

	cls: 'overview-editing-listitem discussion',

	dropPlaceholderStyles: {
		side: 'left'
	},

	getPreviewType: function() {
		return 'course-overview-discussion';
	}
});
