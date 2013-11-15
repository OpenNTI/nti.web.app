Ext.define('NextThought.model.forums.Topic', {
	extend: 'NextThought.model.forums.Base',

	isTopic: true,

	fields: [
		{ name: 'PostCount', type: 'int', persist: false },
		{ name: 'title', type: 'string' },
		{ name: 'PublicationState', type: 'string', persist: false },
		{ name: 'NewestDescendant', type: 'singleitem', persist: false }
	]
});
