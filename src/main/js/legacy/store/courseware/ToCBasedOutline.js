const Ext = require('@nti/extjs');

require('internal/legacy/model/courses/navigation/Node');

module.exports = exports = Ext.define(
	'NextThought.store.courseware.ToCBasedOutline',
	{
		extend: 'Ext.data.Store',
		model: 'NextThought.model.courses.navigation.Node',
	}
);
