const Ext = require('@nti/extjs');

require('./Base');


module.exports = exports = Ext.define('NextThought.model.preference.badges.Course', {
	extend: 'NextThought.model.preference.badges.Base',

	fields: [
		{name: 'show_course_badges', type: 'bool'}
	],

	getResourceUrl: function () {
		var base = this.callParent(arguments);

		return base + '/Course';
	}
});
