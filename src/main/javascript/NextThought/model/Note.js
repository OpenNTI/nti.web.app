Ext.define('NextThought.model.Note', {
	extend: 'NextThought.model.Base',

	mixins: {
		bodyContent: 'NextThought.mixins.ModelWithBodyContent'
	},

	statics: {
		createFromHighlight: function(hl){

			var p = LocationProvider.getPreferences();
			p = p ? p.sharing : null;
			p = p ? p.sharedWith || [] : null;

			return this.create({
				ContainerId: hl.get('ContainerId'),
				sharedWith: p || hl.get('sharedWith'),
				prohibitReSharing: hl.get('prohibitReSharing'),
				tags: hl.get('tags'),
				selectedText: hl.get('selectedText'),
				applicableRange: hl.get('applicableRange')
			});
		}
	},

	requires: [
		'NextThought.model.anchorables.DomContentRangeDescription',
		'NextThought.model.converters.ContentRangeDescription'
	],


	canReply: true,

	fields: [
		{ name: 'ReferencedByCount', type: 'int'},
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
	},

	/**
	 * This depends on the linking of models by annotation...
	 */
	getReplyCount: function(){
		if(this.raw.hasOwnProperty('ReferencedByCount')){
			return this.get('ReferencedByCount');
		}

		return (this.children||[]).reduce(function(sum,child){
			return sum + 1 + (child.getReplyCount ? (child.getReplyCount()||0) : 0);
		},0);
	}
});
