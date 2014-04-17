Ext.define('NextThought.model.courseware.navigation.CourseOutlineContentNode', {
	extend: 'NextThought.model.courseware.navigation.CourseOutlineNode',
	mimeType: 'application/vnd.nextthought.courses.courseoutlinecontentnode',
	fields: [
		{name: 'NTIID', type: 'string', mapping: 'ContentNTIID'}
	]
});
