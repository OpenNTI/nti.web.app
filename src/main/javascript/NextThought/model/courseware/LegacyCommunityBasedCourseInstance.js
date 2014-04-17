Ext.define('NextThought.model.courseware.LegacyCommunityBasedCourseInstance', {
	extend: 'NextThought.model.courseware.CourseInstance',
	mimeType: 'application/vnd.nextthought.courses.legacycommunitybasedcourseinstance',

	fields: [
		{ name: 'Scopes', type: 'auto', mapping: 'LegacyScopes' }
	]
});
