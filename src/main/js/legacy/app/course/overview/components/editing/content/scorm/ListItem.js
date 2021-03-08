const Ext = require('@nti/extjs');
const SCORMRef = require('internal/legacy/model/courses/scorm/SCORMReference');

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.content.scorm.ListItem',
	{
		extend:
			'NextThought.app.course.overview.components.editing.content.ListItem',
		alias: 'widget.overivew-editing-scorm-listitem',

		statics: {
			getSupported() {
				return SCORMRef.mimeType;
			},
		},

		getPreviewType() {
			return 'course-overview-record';
		},
	}
);
