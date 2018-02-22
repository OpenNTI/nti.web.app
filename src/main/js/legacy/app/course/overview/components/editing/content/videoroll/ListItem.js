const Ext = require('extjs');
const {RequirementMultiSelect} = require('nti-web-course');

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
		const groups = [
			{
				title: 'Videos',
				items: (record && record.get('Items') || [])
					.map(x => {
						return {
							name: x.get('title'),
							id: x.get('ntiid')
						};
					})
			}
		];

		return {
			xtype: 'react',
			component: RequirementMultiSelect,
			groups
		};
	},
});
