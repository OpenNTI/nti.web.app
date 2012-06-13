Ext.define('NextThought.model.anchorables.TextDomContentPointer', {
	extend: 'NextThought.model.anchorables.DomContentPointer',

	requires: [
		'NextThought.model.anchorables.DomContentPointer'
	],

	config: {
		ancestor: {},
		contexts: [],
		edgeOffset: 0
	},

	constructor: function(o){
		this.validateContexts(o.contexts);
		this.validateEdgeOffset(o.edgeOffset);
		this.validateAncestor(o.ancestor);

		return this.callParent(arguments);
	},


	validateAncestor: function(a) {
		if (!a || !(a instanceof NextThought.model.anchorables.DomContentPointer)) {
			Ext.Error.raise('Ancestor must be supplied');
		}
		else if (a instanceof NextThought.model.anchorables.ElementDomContentPointer && a.getRole() !== 'ancestor') {
			Ext.Error.raise('If ancestor is an ElementDomContentPointer, role must be of value ancestor');
		}
	},


	validateContexts: function(contexts) {
		if (!contexts) {
			Ext.Error.raise('Must supply TextContexts');
		}
		else if (contexts.length < 1) {
			Ext.Error.raise('Must supply at least 1 TextContext');
		}
	},


	validateEdgeOffset: function(o) {
		if (!o || o < 0) {
			Ext.Error.raise('Offset must exist and be 0 or more');
		}
	}

});