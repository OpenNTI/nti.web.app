Ext.define('NextThought.model.courseware.AssignmentCollection',{
	extend: 'NextThought.model.Base',

	statics: {
		fromJson: function(json){
			if (!json) { return null; }
			var href = json.href;

			delete json.href;

			return this.create({Items: json, href: href});
		}
	},

	fields: [
		{name: 'Items', type: 'collectionItem'}
	],


	isEmpty: function(){
		return this.get('Items').length === 0;
	},


	getItem: function(id) {
		return this.getFieldItem('Items', id);
	}
});