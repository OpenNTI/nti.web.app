const Ext = require('@nti/extjs');

const MediaviewerActions = require('legacy/app/mediaviewer/Actions');

require('./Content');


module.exports = exports = Ext.define('NextThought.app.context.components.cards.Slide', {
	extend: 'NextThought.app.context.components.cards.Content',
	alias: 'widget.context-slide-card',
	cls: 'context-card',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'context-image image-context slide'}
	]),

	renderSelectors: {
		imageEl: '.image-context'
	},

	constructor: function () {
		this.callParent(arguments);
		this.MediaActions = MediaviewerActions.create();
	},

	setContent: function () {
		if (this.contextDom && this.imageEl) {
			this.imageEl.appendChild(this.contextDom);
		}
	}
});
