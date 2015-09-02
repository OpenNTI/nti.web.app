Ext.define('NextThought.app.context.components.Question', {
	extend: 'Ext.Component',
	alias: 'widget.question-context',

	requires: [
		'NextThought.app.context.StateStore'
	],

	cls: 'context-content question-context',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'snippet cls'},
		{cls: 'see-more hidden', html: 'Read More'}
	]),


	renderSelectors: {
		snippetEl: '.snippet',
		seeMoreEl: '.see-more'
	},


	initComponent: function() {
		this.callParent(arguments);
		this.ContextStore = NextThought.app.context.StateStore.getInstance();
	},


	afterRender: function() {
		this.callParent(arguments);

		this.__setContent();

		if (this.doNavigate && !this.isInContent() && this.seeMoreEl) {
			this.seeMoreEl.removeCls('hidden');

			this.mon(this.seeMoreEl, 'click', this.doNavigate.bind(this, this.question));
		}
	},


	isInContent: function() {
		var context = this.ContextStore.getContext(),
			currentContext = context && context.last(),
			contextRecord = currentContext && currentContext.obj;

		return contextRecord && contextRecord.getId() === this.question.get('containerId');
	},


	__setContent: function() {
		var content = this.question && this.question.get('content'),
		readerLocation = this.ContextStore.getReaderLocation(),
		root = readerLocation.root;

		if (content && this.rendered) {
			this.snippetEl.dom.innerHTML = ContentUtils.fixReferences(content, root);
		}
	}
});
