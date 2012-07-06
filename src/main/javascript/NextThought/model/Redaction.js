Ext.define('NextThought.model.Redaction', {
	extend: 'NextThought.model.Base',

	requires: [
		'NextThought.model.anchorables.DomContentRangeDescription',
		'NextThought.model.converters.ContentRangeDescription',
		'NextThought.model.Highlight'
	],

	statics: {
		createFromHighlight: function(hl){
			return Ext.create('NextThought.model.Redaction', {
				ContainerId: hl.get('ContainerId'),
				sharedWith: hl.get('sharedWith'),
				prohibitReSharing: hl.get('prohibitReSharing'),
				tags: hl.get('tags'),
				selectedText: hl.get('selectedText'),
				applicableRange: hl.get('applicableRange')
			});
		}
	},

	fields: [
		{ name: 'sharedWith', type: 'UserList'},
		{ name: 'prohibitReSharing', type: 'boolean' },
		{ name: 'AutoTags', type: 'Auto'},
		{ name: 'tags', type: 'Auto'},
		{ name: 'selectedText', type: 'string'},
		{ name: 'replacementText', type: 'string', defaultValue: 'redaction'},
		{ name: 'reasonText', type: 'string', defaultValue: 'Reason for redaction goes here...'},
		{ name: 'applicableRange', type: 'ContentRangeDescription'}
	]
});