var Ext = require('extjs');
var ComponentsQuestion = require('../Question');


module.exports = exports = Ext.define('NextThought.app.context.components.cards.Question', {
	extend: 'NextThought.app.context.components.Question',
	alias: 'widget.question-context-card',

	cls: 'context-content question-context card',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'snippet', html: '{content}'}
	]),


	renderSelectors: {
		snippetEl: '.snippet'
	}
});
