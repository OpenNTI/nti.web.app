var Ext = require('extjs');
var ModelBase = require('../Base');


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
		{ name: 'Sufix', type: 'string' },
		{ name: 'Title', type: 'string' },

		{ name: 'photo', type: 'string', mapping: 'defaultphoto', persist: false }
	]
});
