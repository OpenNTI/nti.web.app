const Ext = require('extjs');

require('../Base');


module.exports = exports = Ext.define('NextThought.model.courseware.CourseActivity', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Items', type: 'arrayItem'},
		{name: 'TotalItemCount', type: 'int'},
		{name: 'lastViewed', type: 'date', dateFormat: 'timestamp'}
	]
});
