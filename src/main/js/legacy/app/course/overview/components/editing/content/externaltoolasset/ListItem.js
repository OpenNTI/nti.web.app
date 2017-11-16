const Ext = require('extjs');

const ExternalToolAssetRef = require('legacy/model/ExternalToolAsset');

require('../../../parts/ExternalToolAsset');
require('../ListItem');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.externaltoolasset.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-externaltoolasset-listitem',

	statics: {
		getSupported: function () {
			return ExternalToolAssetRef.mimeType;
		}
	},

	getPreviewType: function () {
		return 'course-overview-externaltoolasset';
	},

});
