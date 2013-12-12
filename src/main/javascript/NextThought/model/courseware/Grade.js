Ext.define('NextThought.model.courseware.Grade', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'username', type: 'string'},
		{name: 'grade', type: 'float'},
		{name: 'AutoGrade', type: 'bool'}
	]
});
