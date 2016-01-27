/**
 * TODO: This is a duplicate of the NextThought.model.courseware.CourseInstanceEnrollment
 * However they currently expose fields named differently, we need to refactor this and use only one
 * moving forward.
 * 
 */
Ext.define('NextThought.model.courses.CourseInstanceEnrollment', {
	extend: 'Ext.data.Model',

	idProperty: 'id',

	mixins: {
		hasLinks: 'NextThought.mixins.HasLinks'
	},

	fields: [
		{name: 'id', type: 'string', mapping: 'Username'},
		{name: 'username', type: 'string', mapping: 'Username', convert: function(v, r) {
			return (r.raw.LegacyEnrollmentStatus === 'ForCredit' && v) || '';
		}},
		{name: 'Creator', type: 'singleItem', mapping: 'UserProfile' },
		{name: 'LegacyEnrollmentStatus', type: 'string'}
	]
});
