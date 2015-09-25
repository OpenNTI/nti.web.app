export default Ext.define('NextThought.model.courses.CourseInstanceAdministrativeRole', {
	extend: 'NextThought.model.Base',

	isAdministrative: true,
	idProperty: 'href',
	fields: [
		{ name: 'CourseInstance', type: 'singleItem', persist: false },
		{ name: 'RoleName', type: 'string' },
		{ name: 'Status', type: 'string', persist: false, defaultValue: 'ForCredit' }
	],


	__precacheEntry: function() {
		var instance = this.get('CourseInstance');

		instance.setEnrollment(this);

		return instance.__precacheEntry();
	},


	getCourseCatalogEntry: function() {
		return this.get('CourseInstance').getCourseCatalogEntry();
	},

	//return false since admins are enrolled for credit
	isOpen: function() {
		return false;
	}
});
