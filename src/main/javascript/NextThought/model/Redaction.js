Ext.define('NextThought.model.Redaction', {
	extend: 'NextThought.model.Base',

	mixins: {
		bodyContent: 'NextThought.mixins.ModelWithBodyContent'
	},

	requires: [
		'NextThought.model.anchorables.DomContentRangeDescription',
		'NextThought.model.converters.ContentRangeDescription',
		'NextThought.model.Highlight'
	],

	statics: {

		DEFAULT_TEXT: '<big>***</big>',

		createFromHighlight: function(hl, block){
			return this.create({
				ContainerId: hl.get('ContainerId'),
				sharedWith: hl.get('sharedWith'),
				prohibitReSharing: hl.get('prohibitReSharing'),
				tags: hl.get('tags'),
				selectedText: hl.get('selectedText'),
				applicableRange: hl.get('applicableRange'),
				replacementContent: block ? null : this.DEFAULT_TEXT
			});
		}
	},

	fields: [
		{ name: 'sharedWith', type: 'UserList'},
		{ name: 'prohibitReSharing', type: 'boolean' },
		{ name: 'AutoTags', type: 'Auto'},
		{ name: 'tags', type: 'Auto'},
		{ name: 'selectedText', type: 'string'},
		{ name: 'replacementContent', type: 'string'},
		{ name: 'redactionExplanation', type: 'string'},
		{ name: 'applicableRange', type: 'ContentRangeDescription'}
	]
});
