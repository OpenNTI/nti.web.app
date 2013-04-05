Ext.define('NextThought.model.forums.Topic', {
	extend: 'NextThought.model.forums.Base',

	fields: [
		{ name: 'PostCount', type: 'int', persist: false },
		{ name: 'title', type: 'string' }
	]
});
