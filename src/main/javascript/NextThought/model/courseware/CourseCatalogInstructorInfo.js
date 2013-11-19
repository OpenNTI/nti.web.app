Ext.define('NextThought.model.courseware.CourseCatalogInstructorInfo', {
	alternateClassName: 'NextThought.model.courseware.CourseCatalogInstructorLegacyInfo',
	extend: 'Ext.data.Model',

	idProperty: 'Username',
	fields: [
		{ name: 'Class', type: 'string' },
		{ name: 'JobTitle', type: 'string' },
		{ name: 'MimeType', type: 'string' },
		{ name: 'Name', type: 'string' },
		{ name: 'Sufix', type: 'string' },
		{ name: 'Title', type: 'string' },

		{ name: 'Username', type: 'string', persist: false },
		{ name: 'hasProfile', type: 'bool', persist: false, defaultValue: false },
		{ name: 'photo', type: 'string', mapping: 'defaultphoto' },
		{ name: 'associatedUser', type: 'auto', persist: false }
	]
});
