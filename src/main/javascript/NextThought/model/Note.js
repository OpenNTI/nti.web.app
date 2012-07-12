Ext.define('NextThought.model.Note', {
	extend: 'NextThought.model.Base',

	mixins: {
		bodyContent: 'NextThought.mixins.ModelWithBodyContent'
	},

	requires: [
		'NextThought.model.anchorables.DomContentRangeDescription',
		'NextThought.model.converters.ContentRangeDescription'
	],

	fields: [
		{ name: 'inReplyTo', type: 'string' },
		{ name: 'references', type: 'auto', defaultValue: [] },
		{ name: 'AutoTags', type: 'Auto'},
		{ name: 'tags', type: 'Auto'},
		{ name: 'applicableRange', type: 'ContentRangeDescription'},
		{ name: 'body', type: 'auto' },
		{ name: 'selectedText', type: 'string'},
		{ name: 'style', type: 'string' },
		{ name: 'sharedWith', type: 'UserList' },
		{ name: 'prohibitReSharing', type: 'boolean' }
	],


	getRoot: function() {
		var current = this,
			currentParent = current.parent;

		while(currentParent && currentParent.parent){
			current = currentParent;
			currentParent = currentParent.parent;
		}

		return current;
	},

	/**
	 * From a note, build its reply
	 * @param {NextThought.model.Note} note
	 * @return {NextThought.model.Note}
	 */
	makeReply: function(){
		var note = this,
			reply = this.self.create(),
			parent = note.get('NTIID'),
			refs = Ext.Array.clone(note.get('references') || []);

		refs.push(parent);

		reply.set('applicableRange', note.get('applicableRange'));
		reply.set('ContainerId', note.get('ContainerId'));
		reply.set('inReplyTo', parent);
		reply.set('references', refs);

		return reply;
	}
});
