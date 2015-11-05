Ext.define('NextThought.model.courseware.CourseInstanceEnrollment', {
	extend: 'NextThought.model.Base',

	idProperty: 'href',
	fields: [
		{ name: 'CourseInstance', type: 'singleItem', persist: false },
		{ name: 'Username', type: 'string' },
		{ name: 'Status', type: 'string', mapping: 'LegacyEnrollmentStatus'},
		{ name: 'RealEnrollmentStatus', type: 'string'},
		{ name: 'VendorThankYouPage', type: 'auto'}
	],


	__precacheEntry: function() {
		var instance = this.get('CourseInstance');

		instance.setEnrollment(this);

		return instance.__precacheEntry();
	},


	getCourseCatalogEntry: function() {
		return this.get('CourseInstance').getCourseCatalogEntry();
	},

	isOpen: function() {
		var status = this.get('Status');

		return status === 'Open';
	},


	isDroppable: function() {
		/**
		 * NOTE: We need better heuristic to tell dropable course from non dropable. 
		 * For now, if it's open, then it can be droped. 
		 * Or if it's real enrollment is Public (as opposed to Purchased, ForCredit, ForCreditNonDegree)
		 */
		return this.isOpen() || this.get('RealEnrollmentStatus') === 'Public';
	}
});
