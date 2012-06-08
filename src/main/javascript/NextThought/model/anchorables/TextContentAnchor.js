/**
 * Text Content Anchor Class defines an anchorable text node in the DOM, defined
 * by an set of text and offsets both within the context and within the text
 */
Ext.define('NextThought.model.anchorables.TextContentAnchor', {
	extend: 'NextThought.model.anchorables.ContentAnchor',

	config: {
		contextText: '',
		contextOffset: 0,
		edgeOffset: 0
	},
	constructor: function(o){
		this.initConfig(o);
	}
});