Ext.define('NextThought.model.forums.Post', {
	extend: 'NextThought.model.forums.Base',
	mixins: {
		bodyContent: 'NextThought.mixins.ModelWithBodyContent'
	},

	isPost: true,

	fields: [
		{ name: 'body', type: 'auto' },
		{ name: 'title', type: 'string' }
	]
});
