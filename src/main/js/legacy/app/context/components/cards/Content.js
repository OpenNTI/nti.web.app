const Ext = require('@nti/extjs');

const ContextStateStore = require('../../StateStore');


module.exports = exports = Ext.define('NextThought.app.context.components.cards.Content', {
	extend: 'Ext.Component',
	alias: 'widget.context-content-card',
	cls: 'context-card',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'context-image word-context', cn: [
			{cls: 'text'}
		]}
	]),

	renderSelectors: {
		textEl: '.text'
	},

	initComponent: function () {
		this.callParent(arguments);
		this.ContextStore = ContextStateStore.getInstance();
	},

	afterRender: function () {
		this.callParent(arguments);
		this.setContent();
	},

	/*
	 * Override this if you want to set content after the component's been rendered.
	 */
	setContent: function () {
		var div = document.createElement('div');

		if (this.textEl && this.snippet) {
			div.appendChild(this.snippet);

			this.textEl.dom.innerHTML = div.innerHTML;
		} else if (this.textEl) {
			this.addCls('hidden');
		}
	}
});
