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
	],

	addItem: function(rec){
		var items = this.get('Items'),
			key = items.length;

		items.push(rec);
		items.INDEX_KEYMAP[rec.get('Username')] = key;
		this.afterEdit(['Items']);
	}
});
