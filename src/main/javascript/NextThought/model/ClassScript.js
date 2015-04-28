Ext.define('NextThought.model.ClassScript', {
	extend: 'NextThought.model.Base',

	mixins: {
		bodyContent: 'NextThought.mixins.ModelWithBodyContent'
	},

	fields: [
		{ name: 'Class', type: 'string', defaultValue: 'ClassScript'},
		{ name: 'body', type: 'auto' }
	]
});
