Ext.define('NextThought.model.forums.Forum', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'DCDescription', type: 'string' },
		{ name: 'DCTitle', type: 'string' },
		{ name: 'description', type: 'string' },
		{ name: 'title', type: 'string' },
		{ name: 'TopicCount', type: 'int', persist: false }
	]
});
