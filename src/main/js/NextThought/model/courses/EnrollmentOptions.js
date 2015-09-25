export default Ext.define('NextThought.model.courses.EnrollmentOptions', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.courseware.enrollmentoptions',

	fields: [
		{name: 'Items', type: 'auto', converter: function(v) {
			return Ext.clone(v);
		}}
	],


	getType: function(name) {
		var items = this.get('Items');

		return items[name];
	},

	setType: function(name, option) {
		var items = this.get('Items');

		items[name] = option;

		this.set('Items', items);
	}
});
