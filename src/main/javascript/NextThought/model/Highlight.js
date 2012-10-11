Ext.define('NextThought.model.Highlight', {
	extend: 'NextThought.model.Base',

	requires: [
		'NextThought.model.anchorables.DomContentRangeDescription',
		'NextThought.model.converters.ContentRangeDescription'
	],

	fields: [
		{ name: 'sharedWith', type: 'UserList'},
		{ name: 'prohibitReSharing', type: 'boolean' },
		{ name: 'AutoTags', type: 'Auto'},
		{ name: 'tags', type: 'Auto'},
		{ name: 'selectedText', type: 'string'},
		{ name: 'style', type: 'string'},
		{ name: 'applicableRange', type: 'ContentRangeDescription'},

		{ name: 'GroupingField', mapping: 'Last Modified', type: 'groupByTime'}
	]
});
