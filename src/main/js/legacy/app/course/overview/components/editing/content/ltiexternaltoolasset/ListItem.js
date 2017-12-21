const Ext = require('extjs');

const LTIExternalToolAssetRef = require('legacy/model/LTIExternalToolAsset');

require('../../../parts/LTIExternalToolAsset');
require('../ListItem');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.ltiexternaltoolasset.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-ltiexternaltoolasset-listitem',

	statics: {
		getSupported: function () {
			return LTIExternalToolAssetRef.mimeType;
		}
	},

	getPreviewType: function () {
		return 'course-overview-ltiexternaltoolasset';
	},

	getPreview: function (record) {
		var item = record.getRaw(),
			type = this.getPreviewType(record);

		if (!type) {
			return null;
		}

		return Ext.applyIf({
			xtype: type,
			locationInfo: this.locationInfo,
			courseRecord: this.outlineNode,
			assignment: this.assignment,
			course: this.course,
			record: record,
			ntiid: item.NTIID,
			navigate: this.doNavigation.bind(this),
			inEditMode: true
		}, item);
	},

});
