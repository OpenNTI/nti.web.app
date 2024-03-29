const Ext = require('@nti/extjs');
const PollRef = require('internal/legacy/model/PollRef');

require('../../../parts/Poll');
require('../ListItem');

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.content.poll.ListItem',
	{
		extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
		alias: 'widget.overview-editing-poll-listitem',

		statics: {
			getSupported: function () {
				return PollRef.mimeType;
			},
		},

		getPreviewType: function () {
			// return 'widget.course-overview-pollref';//comment this out for now since we don't support it yet
		},
	}
);
