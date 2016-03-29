var Ext = require('extjs');
var ContentListItem = require('../ListItem');
var PartsPoll = require('../../../parts/Poll');
var ModelPollRef = require('../../../../../../../model/PollRef');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.poll.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-poll-listitem',

	statics: {
		getSupported: function () {
			return NextThought.model.PollRef.mimeType;
		}
	},

	getPreviewType: function () {
		// return 'widget.course-overview-pollref';//comment this out for now since we don't support it yet
	}
});
