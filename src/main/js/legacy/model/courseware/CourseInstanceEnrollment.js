const Ext = require('extjs');

require('../Base');


module.exports = exports = Ext.define('NextThought.model.courseware.CourseInstanceEnrollment', {
	extend: 'NextThought.model.Base',

	idProperty: 'href',
	fields: [
		{ name: 'CourseInstance', type: 'singleItem', persist: false },
		{ name: 'Username', type: 'string' },
		{ name: 'Status', type: 'string', mapping: 'LegacyEnrollmentStatus'},
		{ name: 'RealEnrollmentStatus', type: 'string'},
		{ name: 'VendorThankYouPage', type: 'auto'}
	],


	__precacheEntry: function () {
		var instance = this.get('CourseInstance');

		instance.setEnrollment(this);

		return instance.__precacheEntry();
	},


	getCourseCatalogEntry: function () {
		return this.get('CourseInstance').getCourseCatalogEntry();
	},

	isOpen: function () {
		var status = this.get('Status');

		return status === 'Open';
	}
});
