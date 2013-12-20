Ext.define('NextThought.model.courseware.Grade', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Username', type: 'string'},
		{name: 'value', type: 'float'},
		{name: 'AssignmentId', type: 'string'}
	]
});
