Ext.define('NextThought.model.courseware.UsersCourseAssignmentHistory', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Items', type: 'collectionItem', persist: false},
		{name: 'lastViewed', type: 'date', dateFormat: 'timestamp'}
	],


	getItem: function(id) {
		return this.getFieldItem('Items', id);
	},


	statics: {
		getEmpty: function() {
			var e = this.create({lastViewed: new Date()});
			e.getItem = Ext.emptyFn;
			return e;
		}
	}
});
