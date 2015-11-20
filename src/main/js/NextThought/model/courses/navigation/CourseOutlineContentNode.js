Ext.define('NextThought.model.courses.navigation.CourseOutlineContentNode', {
	extend: 'NextThought.model.courses.navigation.CourseOutlineNode',
	mimeType: 'application/vnd.nextthought.courses.courseoutlinecontentnode',
	fields: [
		{name: 'NTIID', type: 'string', mapping: 'ContentNTIID'}
	],


	getFirstContentNode: function() {
		return this;
	}
});
