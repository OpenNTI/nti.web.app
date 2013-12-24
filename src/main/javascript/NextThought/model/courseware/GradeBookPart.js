Ext.define('NextThought.model.courseware.GradeBookPart', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Items', type: 'collectionItem'},
		{name: 'Name', type: 'string'},
		{name: 'displayName', type: 'string'},
		{name: 'gradeScheme', type: 'auto'},
		{name: 'order', type: 'int'}
	]
});
