Ext.define('NextThought.model.forums.Post', {
	extend: 'NextThought.model.Base',
	mixins: {
		bodyContent: 'NextThought.mixins.ModelWithBodyContent'
	},
	fields: [
		{ name: 'Class', type: 'string', persist: true },
		{ name: 'body', type: 'auto' },
		{ name: 'title', type: 'string' }
	]
});
