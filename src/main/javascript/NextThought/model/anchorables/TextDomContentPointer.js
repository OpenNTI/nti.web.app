/**
 * Text Content Anchor Class defines an anchorable text node in the DOM, defined
 * by an set of text and offsets both within the context and within the text
 */
Ext.define('NextThought.model.anchorables.TextDomContentPointer', {
	extend: 'NextThought.model.anchorables.DomContentPointer',

	config: {
		contexts: [],
		edgeOffset: 0
	},

	constructor: function(o){
		this.validateContexts(o.contexts);
		this.validateEdgeOffset(o.edgeOffset);

		this.initConfig(o);
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