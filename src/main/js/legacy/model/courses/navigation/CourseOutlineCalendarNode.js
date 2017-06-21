const Ext = require('extjs');

require('./CourseOutlineNode');


module.exports = exports = Ext.define('NextThought.model.courses.navigation.CourseOutlineCalendarNode', {
	extend: 'NextThought.model.courses.navigation.CourseOutlineNode',
	mimeType: 'application/vnd.nextthought.courses.courseoutlinecalendarnode',

	statics: {
		mimeType: 'application/vnd.nextthought.courses.courseoutlinecalendarnode'
	}
});
