const Ext = require('@nti/extjs');

require('../Base');


module.exports = exports = Ext.define('NextThought.model.courses.CourseCatalogInstructorInfo', {
	alternateClassName: 'NextThought.model.courses.CourseCatalogInstructorLegacyInfo',
	mimeType: 'application/vnd.nextthought.courses.coursecataloginstructorlegacyinfo',
	extend: 'NextThought.model.Base',

	idProperty: 'Name',
	fields: [
		{ name: 'Class', type: 'string' },
		{ name: 'JobTitle', type: 'string' },
		{ name: 'MimeType', type: 'string' },
		{ name: 'Name', type: 'string' },
		{ name: 'Suffix', type: 'string' },
		{ name: 'Title', type: 'string' },
		{ name: 'username', type: 'string' },
		{ name: 'Biography', type: 'string' },

		{ name: 'photo', type: 'string', mapping: 'defaultphoto', persist: false }
	]
});
