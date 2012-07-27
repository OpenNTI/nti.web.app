Ext.define('NextThought.model.Note', {
	extend: 'NextThought.model.Base',

	mixins: {
		bodyContent: 'NextThought.mixins.ModelWithBodyContent'
	},

	statics: {
		createFromHighlight: function(hl){
			return this.create({
				ContainerId: hl.get('ContainerId'),
				sharedWith: hl.get('sharedWith'),
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

	constructor: function(){
		var r = this.callParent(arguments);
		this.addEvents('changed');
		this.enableBubble('changed');
		return r;
	},


	getBubbleParent: function(){
		return this.parent;
	},


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
	},

	/**
	 * This depends on the linking of models by annotation...
	 */
	getReplyCount: function(){
		if(!this.children) {return 0;}

		return this.children.reduce(function(sum,child){
			return sum + 1 + child.getReplyCount ? child.getReplyCount() : 0;
		},0);
	}
});
