Ext.define('NextThought.model.courseware.LegacyCommunityBasedCourseInstance', {
	extend: 'NextThought.model.courseware.CourseInstance',

	fields: [
		{ name: 'Scopes', type: 'auto', mapping: 'LegacyScopes' }
	]
});
