Ext.define('NextThought.model.courses.CourseInstanceEnrollment', {
	extend: 'Ext.data.Model',

	idProperty: 'id',

	mixins: {
		hasLinks: 'NextThought.mixins.HasLinks'
	},

	fields: [
		{name: 'id', type: 'string', mapping: 'Username'},
		{name: 'username', type: 'string', mapping: 'Username', convert: function(v, r) {
			return (r.raw.LegacyEnrollmentStatus === 'ForCredit' && v) || ''; }},
		{name: 'Creator', type: 'singleItem', mapping: 'UserProfile' },
		{name: 'LegacyEnrollmentStatus', type: 'string'}
	]
})