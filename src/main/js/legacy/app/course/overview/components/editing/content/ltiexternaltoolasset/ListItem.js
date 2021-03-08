const Ext = require('@nti/extjs');
const LTIExternalToolAssetRef = require('internal/legacy/model/LTIExternalToolAsset');

require('../../../parts/LTIExternalToolAsset');
require('../ListItem');

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.content.ltiexternaltoolasset.ListItem',
	{
		extend:
			'NextThought.app.course.overview.components.editing.content.ListItem',
		alias: 'widget.overview-editing-ltiexternaltoolasset-listitem',

		statics: {
			getSupported: function () {
				return LTIExternalToolAssetRef.mimeType;
			},
		},

		canEdit: true,

		getPreviewType: function () {
			return 'course-overview-ltiexternaltoolasset';
		},
	}
);
