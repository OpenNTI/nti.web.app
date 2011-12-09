Ext.define('NextThought.model.Hit', {
    extend: 'NextThought.model.Base',
	requires: [
		'NextThought.proxy.Rest'
	],
	fields: [
		{ name: 'Class', type: 'string' },
		{ name: 'ContainerId', type: 'string'},
		{ name: 'Last Modified', type: 'date', dateFormat: 'timestamp' },
		{ name: 'Snippet', type: 'string' },
		{ name: 'TargetOID', type: 'string' },
		{ name: 'Title', type: 'string' },
		{ name: 'Type', type: 'string' }
	],
	proxy: {
		type: 'nti-mimetype',
		model: 'NextThought.model.Hit'
	},
	getModelName: function() {
		return 'Hit';
	}
});
