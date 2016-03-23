var Ext = require('extjs');
var ContentListItem = require('../ListItem');
var PartsContentLink = require('../../../parts/ContentLink');
var ModelRelatedWork = require('../../../../../../../model/RelatedWork');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-contentlink-listitem',

	statics: {
		getSupported: function() {
			return NextThought.model.RelatedWork.mimeType;
		}
	},

	canEdit: true,

	getPreviewType: function(record) {
		return 'course-overview-content';
	},

	getControls: function(record, bundle) {
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
	}
});
