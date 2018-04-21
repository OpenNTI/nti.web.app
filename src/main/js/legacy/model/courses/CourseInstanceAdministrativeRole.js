const Ext = require('@nti/extjs');
require('../courseware/CourseInstanceEnrollment');


module.exports = exports = Ext.define('NextThought.model.courses.CourseInstanceAdministrativeRole', {
	extend: 'NextThought.model.courseware.CourseInstanceEnrollment',
	mimeType: 'application/vnd.nextthought.courseware.courseinstanceadministrativerole',

	isAdministrative: true,
	idProperty: 'href',
	fields: [
		{ name: 'RoleName', type: 'string' },
		{ name: 'Status', type: 'string', persist: false, defaultValue: 'ForCredit' }
	],


	//return false since admins are enrolled for credit
	isOpen () {
		return false;
	}
});
