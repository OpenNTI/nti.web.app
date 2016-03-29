var Ext = require('extjs');
var ModelBase = require('../Base');


module.exports = exports = Ext.define('NextThought.model.courses.CourseInstanceAdministrativeRole', {
	extend: 'NextThought.model.Base',

	isAdministrative: true,
	idProperty: 'href',
	fields: [
		{ name: 'CourseInstance', type: 'singleItem', persist: false },
		{ name: 'RoleName', type: 'string' },
		{ name: 'Status', type: 'string', persist: false, defaultValue: 'ForCredit' }
	],


	__precacheEntry: function () {
		var instance = this.get('CourseInstance');

		instance.setEnrollment(this);

		return instance.__precacheEntry();
	},


	getCourseCatalogEntry: function () {
		return this.get('CourseInstance').getCourseCatalogEntry();
	},

	//return false since admins are enrolled for credit
	isOpen: function () {
		return false;
	},


	/**
	 * A content editor has less access compared to an admin (i.e. course instructor)
	 * Right now, since we don't have any clear way of telling whether or not we have a content editor
	 * We will use the check for the GradeBook variable to determine that, 
	 * given that content editors shouldn't have access to the GradeBook.
	 * 
	 * @return {Boolean} whether or not this is a content editor
	 */
	isContentEditor: function () {
		var instance = this.get('CourseInstance');
		return !(instance && instance.get('GradeBook'));
	}
});
