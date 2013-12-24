Ext.define('NextThought.model.courseware.GradeBookEntry', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'AssignmentId', type: 'string'},
		{name: 'DueDate', type: 'date', dateFormat: 'c'},
		{name: 'Items', type: 'collectionItem'},
		{name: 'Name', type: 'string'},
		{name: 'displayName', type: 'string'},
		{name: 'GradeScheme', type: 'auto'},
		{name: 'order', type: 'int'}
	]
});
