Ext.define('NextThought.app.context.components.Default', {
	extend: 'Ext.Component',
	alias: 'widget.context-default',

	requires: [
		'NextThought.app.context.StateStore'
	],

	cls: 'context-content',


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
		this.__setContent();
	},


	__setContent: function() {
		var context = this.ContextStore.getContext(),
			currentContext = context.last(),
			contextRecord = currentContext && currentContext.obj;

		// If we are within the current context, so just render the simpler version of context.
		// i.e. For content's note, we will just render the range context we were given.
		// For video object, we will only render the transcript range corresponding to that context.
		// Otherwise, render the longer version of context's card 
		// since we are not within the original userData(i.e. Note) context.
		if (contextRecord && contextRecord.get('NTIID') === this.containerId) {
			this.content = this.snippet;
		}
		else {
			this.content = this.fullContext;
		}

		if (this.rendered && this.content) {
			this.targetEl.appendChild(this.content);
		}
	}
});