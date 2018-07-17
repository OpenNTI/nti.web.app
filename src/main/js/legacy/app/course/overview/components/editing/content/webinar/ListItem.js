const Ext = require('@nti/extjs');

const WebinarAsset = require('legacy/model/WebinarAsset');

require('../../../parts/ContentLink');
require('../ListItem');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.webinar.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-webinar-listitem',

	statics: {
		getSupported: function () {
			return WebinarAsset.mimeType;
		}
	},

	canEdit: true,

	getPreviewType: function (record) {
		return 'course-overview-content';
	},

	getControls: function (record, bundle) {
		var config = this.callParent(arguments),
			items = config.items || [],
			visibility = record && record.get('visibility');

		if (visibility !== 'everyone') {
			items.unshift({
				xtype: 'box',
				record: record,
				autoEl: {
					cls: 'visibility', html: visibility
				}
			});
		}

		config.items = items;
		return config;
	},


	doNavigation (config) {
		if (this.navigate) {
			this.navigate(config, null, this.record.hasLink('edit'));
		}
	}
});
