const Ext = require('extjs');

require('../Base');


module.exports = exports = Ext.define('NextThought.model.courses.EnrollmentOptions', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.courseware.enrollmentoptions',

	fields: [
		{name: 'Items', type: 'auto', converter: function (v) {
			return Ext.clone(v);
		}}
	],


	getType: function (name) {
		var items = this.get('Items');

		return items[name];
	},

	setType: function (name, option) {
		var items = this.get('Items');

		items[name] = option;

		this.set('Items', items);
	},

	/**
	 * For now, a course is droppable when we have an explicit open enrollment. Otherwise, it's not.
	 * @return {Boolean} whether it's droppable or not.
	 */
	isDroppable: function () {
		var items = this.get('Items') || {};

		if (!items['OpenEnrollment'] || items['OpenEnrollment'].IsEnrolled !== true) {
			return false;
		}

		return true;
	}
});
