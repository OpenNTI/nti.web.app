Ext.define('NextThought.model.courseware.CourseCreditLegacyInfo', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'Class', type: 'string' },
		{ name: 'MimeType', type: 'string' },
		{ name: 'Hours', type: 'string' },
		{ name: 'Enrollment', type: 'auto' }
	]
});
