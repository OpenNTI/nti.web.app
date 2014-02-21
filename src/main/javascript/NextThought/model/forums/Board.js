Ext.define('NextThought.model.forums.Board', {
	extend: 'NextThought.model.forums.Base',

	isBoard: true,

	fields: [
		{ name: 'ForumCount', type: 'int', persist: false }
	]
});
