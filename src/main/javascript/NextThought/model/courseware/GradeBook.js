Ext.define('NextThought.model.courseware.GradeBook', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Items', type: 'collectionItem'}
	],


	getItem: function(id, book) {
		var b = this.getFieldItem('Items', book || 'default');
		return b && b.getFieldItem('Items', id);
	}
});
