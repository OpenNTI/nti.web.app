Ext.define('NextThought.view.assessment.components.WordBank', {
	extend: 'Ext.Component',
	alias: 'widget.assessment-components-wordbank',

	cls: 'wordbank',

	renderTpl: Ext.DomHelper.markup({ 'tag': 'tpl', 'for': 'entries', cn: [
		{
			cls: 'target wordentry drag',
			'data-wid': '{wid:htmlEncode}',
			'data-lang': '{lang:htmlEncode}',
			'data-word': '{word:htmlEncode}',
			cn: [{cls: 'reset'}, '{word}']
		}
	]}),


	beforeRender: function() {
		var bank = this.record.get('wordbank'),
			e = (bank && bank.get('entries')) || [];

		Ext.apply(this.renderData, {
			entries: e.map(function(e) {return e.getData();})
		});

		return this.callParent(arguments);
	}
});
