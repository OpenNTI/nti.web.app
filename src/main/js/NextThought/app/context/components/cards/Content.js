Ext.define('NextThought.app.context.components.cards.Content', {
	extend: 'Ext.Component',
	alias: 'widget.context-content-card',

	requires: [
		'NextThought.app.context.StateStore'
	],

	cls: 'context-card',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'context-image word-context', cn: [
			{cls: 'text'}
		]}
	]),


	renderSelectors: {
		textEl: '.text'
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
	 * Override this if you want to set content after the component's been rendered.
	 */
	setContent: function() {
		if(this.textEl) {
			this.textEl.appendChild(this.snippet);
		}
	}
});
