Ext.define('NextThought.view.assessment.components.WordBank', {
	extend: 'Ext.Component',
	alias: 'widget.assessment-components-naqwordbank',

	cls: 'wordbank',

	renderTpl: Ext.DomHelper.markup({ 'tag': 'tpl', 'for': 'entries', cn: [
		{
			cls: 'target wordentry drag',
			'data-wid': '{wid:htmlEncode}',
			'data-lang': '{lang:htmlEncode}',
			'data-word': '{word:htmlEncode}',
			cn: [{cls: 'reset'}, '{word}']
		}
	]})
});
