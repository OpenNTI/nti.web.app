Ext.define('NextThought.model.anchorables.TextDomContentPointer', {
	extend: 'NextThought.model.anchorables.DomContentPointer',

	requires: [
		'NextThought.model.anchorables.TextContext',
		'NextThought.model.anchorables.DomContentPointer'
	],

	config: {
		ancestor: {},
		contexts: [],
		edgeOffset: 0
	},

	statics: {
		createFromObject: function(o){
			var cp = NextThought.model.anchorables.ContentPointer;
			return NextThought.model.anchorables.TextDomContentPointer.create({
				role: o.role,
				contexts: NextThought.model.anchorables.TextContext.createFromObjects(o.contexts),
				edgeOffset:o.edgeOffset,
				ancestor: cp.createFromObject(o.ancestor)
			});
		}
	},

	constructor: function(o){
		this.validateContexts(o.contexts);
		this.validateEdgeOffset(o.edgeOffset);
		this.validateAncestor(o.ancestor);
		var r = this.callParent(arguments);
		this.Class = 'TextDomContentPointer';
		return r;
	},


	primaryContext: function(){
	   if(this.getContexts().length > 0){
			   return this.getContexts()[0];
	   }
	   return null;
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
		/*
		if (!o || o < 0) {
			Ext.Error.raise('Offset must exist and be 0 or more');
		}
		*/
	},


	locateRangePointInAncestor: function(ancestorNode, startResult){
		return Anchors.locateRangeEdgeForAnchor(this, ancestorNode, startResult);
	}
});
