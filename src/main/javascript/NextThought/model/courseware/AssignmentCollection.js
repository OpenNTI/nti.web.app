Ext.define('NextThought.model.courseware.AssignmentCollection',{
	extend: 'NextThought.model.Base',

	statics: {
		fromJson: function(json){
			if (!json) { return null; }
			var href = json.href, items = [], key;

			delete json.href;

			for (key in json) {
				if (json.hasOwnProperty(key)) {
					items.push.apply(items, json[key]);
				}
			}

			return this.create({Items: items, href: href});
		}
	},

	fields: [
		{name: 'Items', type: 'arrayItem'}
	],


	isEmpty: function(){
		return this.get('Items').length === 0;
	},


	getItem: function(id) {
		var items = this.get('Items');

		items = items.filter(function(rec){
			return rec.getId() === id || rec.containsId(id);
		});

		return items[0];
	}
});