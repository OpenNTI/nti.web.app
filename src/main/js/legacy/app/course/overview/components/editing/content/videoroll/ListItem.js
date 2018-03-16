const Ext = require('extjs');

const VideoRoll = require('legacy/model/VideoRoll');

require('legacy/overrides/ReactHarness');
require('../../../parts/VideoRoll');
require('../ListItem');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.videoroll.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-videoroll-listitem',

	statics: {
		getSupported: function () {
			return VideoRoll.mimeType;
		}
	},

	getPreviewType: function (record) {
		return 'course-overview-videoroll';
	},


	getRequireControl: function (record, bundle) {
		return null;
	},
});
