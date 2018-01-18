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

});
