Ext.define('NextThought.model.Note', {
	extend: 'NextThought.model.Base',

	requires: [
		'NextThought.model.anchorables.ContentRangeDescription',
		'NextThought.model.converters.ContentRangeDescription'
	],

	fields: [
		{ name: 'inReplyTo', type: 'string' },
		{ name: 'references', type: 'auto', defaultValue: [] },
		{ name: 'AutoTags', type: 'Auto'},
		{ name: 'tags', type: 'Auto'},
		{ name: 'applicableRange', type: 'ContentRangeDescription'},
		{ name: 'body', type: 'auto' },
		{ name: 'sharedWith', type: 'UserList' },
		{ name: 'prohibitReSharing', type: 'boolean' }
	]
});
