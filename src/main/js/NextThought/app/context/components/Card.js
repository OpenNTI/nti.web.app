Ext.define('NextThought.app.context.components.Card', {
	extend: 'Ext.Component',
	alias: 'widget.context-card',

	requires: [
		'NextThought.app.context.StateStore'
	],

	cls: 'context-card',


	renderTpl: Ext.DomHelper.markup([
		{cls: 'content'}
	]),


	renderSelectors: {
		targetEl: '.content'
	},
	
	
	initComponent: function() {
		this.callParent(arguments);
		this.ContextStore = NextThought.app.context.StateStore.getInstance();
	},

	afterRender: function() {
		this.callParent(arguments);
		this.setContent();
	},

	/**
	 * Override to set the right content.
	 */
	setContent: function() {}
});