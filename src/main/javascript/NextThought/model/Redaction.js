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
			var p = LocationProvider.getPreferences();
			p = p ? p.sharing : null;
			p = p ? p.sharedWith || [] : null;

			return this.create({
				ContainerId: hl.get('ContainerId'),
				sharedWith: p || hl.get('sharedWith'),
				prohibitReSharing: hl.get('prohibitReSharing'),
				tags: hl.get('tags'),
				selectedText: hl.get('selectedText'),
				applicableRange: hl.get('applicableRange'),
				replacementContent: this.DEFAULT_TEXT,
				style: block? 'block':'inline',
				redactionExplanation: block? 'Why was this redacted?' : null
			});
		}
	},

	fields: [
		{ name: 'AutoTags', type: 'Auto'},
		{ name: 'applicableRange', type: 'ContentRangeDescription'},
		{ name: 'prohibitReSharing', type: 'boolean' },
		{ name: 'replacementContent', type: 'string'},
		{ name: 'redactionExplanation', type: 'string'},
		{ name: 'selectedText', type: 'string'},
		{ name: 'sharedWith', type: 'UserList'},
		{ name: 'style', type: 'string'},
		{ name: 'tags', type: 'Auto'}
	]
});
