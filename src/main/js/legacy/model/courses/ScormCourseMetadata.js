const Ext = require('extjs');

module.exports = exports = Ext.define('NextThought.model.courses.ScormCourseMetaData', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.courseware_scorm.scormcoursemetadata',
	static: {
		mimeType: 'application/vnd.nextthought.courseware_scorm.scormcoursemetadata'
	}
});
