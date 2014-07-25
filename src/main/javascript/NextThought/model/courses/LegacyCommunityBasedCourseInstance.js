Ext.define('NextThought.model.courses.LegacyCommunityBasedCourseInstance', {
	extend: 'NextThought.model.courses.CourseInstance',
	mimeType: 'application/vnd.nextthought.courses.legacycommunitybasedcourseinstance',

	fields: [
		{ name: 'Scopes', type: 'auto', mapping: 'LegacyScopes' }
	]
});
