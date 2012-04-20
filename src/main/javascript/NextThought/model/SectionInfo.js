Ext.define('NextThought.model.SectionInfo', {
	extend: 'NextThought.model.Base',
	idProperty: 'OID',
	fields: [
		{ name: 'CloseDate', type: 'date', dateFormat: 'timestamp', defaultValue: new Date() },
		{ name: 'OpenDate', type: 'date', dateFormat: 'timestamp', defaultValue: new Date() },
		{ name: 'Description', type: 'string' },
		{ name: 'Enrolled', type: 'UserList' },
		{ name: 'InstructorInfo', type: 'singleItem', defaultValue: null },
		{ name: 'Provider', type: 'singleItem' },
		{ name: 'Sessions', type: 'auto' }
	]
});
