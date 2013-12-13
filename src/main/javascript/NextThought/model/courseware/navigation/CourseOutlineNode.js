Ext.define('NextThought.model.courseware.navigation.CourseOutlineNode', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'DCDescription', type: 'string'},
		{name: 'DCTitle', type: 'string'},
		{name: 'Items', type: 'arrayItem', mapping: 'contents'},
		{name: 'description', type: 'string'},
		{name: 'title', type: 'string'}
	],


	findNode: function(id) {
		if (this.getId() === id) { return this; }
		return (this.get('Items') || []).reduce(function(a, o) {
			return a || (o.findNode && o.findNode(id));
		}, null);
	}
});
