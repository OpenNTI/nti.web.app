var Ext = require('extjs');
var ContextStateStore = require('../StateStore');


module.exports = exports = Ext.define('NextThought.app.context.components.Default', {
	extend: 'Ext.Component',
	alias: 'widget.context-default',
	cls: 'context-content',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'content'},
		{cls: 'see-more hidden', html: 'Read More'}
	]),

	renderSelectors: {
		targetEl: '.content',
		seeMoreEl: '.see-more'
	},

	initComponent: function () {
		this.callParent(arguments);
		this.ContextStore = NextThought.app.context.StateStore.getInstance();
	},

	isInContext: function () {
		var context = this.ContextStore.getContext(),
			currentContext = context.last(),
			contextRecord = currentContext && currentContext.obj,
			currentCmp = currentContext && currentContext.cmp, inContext = false;

		// Add a way for the current component to let us know if it contains a given containerId
		// i.e. Slide notes have the slide as the container, which is contained in by a slidedeck
		// It can be applied to different cases though.
		if (currentCmp && currentCmp.containsId) {
			inContext = currentCmp.containsId(contextRecord, this.containerId);
		}

		return inContext || contextRecord && contextRecord.get('NTIID') === this.containerId;
	},

	afterRender: function () {
		this.callParent(arguments);

		this.__setContent();

		if (this.doNavigate && !this.isInContext()) {
			this.seeMoreEl.removeCls('hidden');

			this.mon(this.seeMoreEl, 'click', this.doNavigate.bind(this, this.record));
		}
	},

	__setContent: function () {
		var div = document.createElement('div');

		// If we are within the current context, so just render the simpler version of context.
		// i.e. For content's note, we will just render the range context we were given.
		// For video object, we will only render the transcript range corresponding to that context.
		// Otherwise, render the longer version of context's card
		// since we are not within the original userData(i.e. Note) context.
		if (this.isInContext()) {
			this.content = this.snippet;
		}
		else {
			this.content = this.fullContext;
		}

		//this.content will be a node, but it won't be a html node, so stuff like image
		//won't render properly if we append it straight to the dom. Do this trick to
		//make it html that gets inserted.
		if (this.rendered && this.content) {
			div.appendChild(this.content);

			this.targetEl.dom.innerHTML = div.innerHTML;
		}
	}
});
