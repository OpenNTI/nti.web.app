Ext.define('NextThought.app.context.components.cards.Slide', {
	extend: 'NextThought.app.context.components.cards.Content',
	alias: 'widget.context-slide-card',

	requires: [
		'NextThought.app.slidedeck.media.Actions'
	],

	cls: 'context-card',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'context-image image-context slide'}
	]),

	renderSelectors: {
		imageEl: '.image-context'
	},


	constructor: function() {
		this.callParent(arguments);
		this.MediaActions = NextThought.app.slidedeck.media.Actions.create();
	},


	setContent: function() {
		if (this.contextDom && this.imageEl) {
			this.imageEl.appendChild(this.contextDom);
		}
	}

});