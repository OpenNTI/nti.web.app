Ext.define('NextThought.model.Hit', {
    extend: 'NextThought.model.Base',
	requires: [
		'NextThought.proxy.Rest'
	],
	fields: [
		{ name: 'Class', type: 'string', defaultValue: 'Hit' },
		{ name: 'ContainerId', type: 'string'},
		{ name: 'Snippet', type: 'string' },
		{ name: 'TargetOID', type: 'string' },
		{ name: 'Title', type: 'string' },
		{ name: 'Type', type: 'string' }
	],
	proxy: {
		type: 'nti',
		model: 'NextThought.model.Hit'
	},
	getModelName: function() {
		return 'Hit';
	}
});
