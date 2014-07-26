Ext.define('NextThought.view.courseware.enrollment.credit.parts.RadioGroup', {
	extend: 'Ext.Component',
	alias: 'widget.credit-radiogroup',

	renderTpl: Ext.DomHelper.markup({tag: 'tpl', 'for': 'options', cn: [
		{tag: 'label', cls: 'credit-input dark full radio', cn: [
			{tag: 'input', type: 'radio', name: '{name}', value: '{value}'},
			{tag: 'span', html: '{text}'}
		]}
	]}),


	beforeRender: function() {
		this.callParent(arguments);

		this.renderTpl.inputname = this.name;

		this.renderData = Ext.apply(this.renderData || {}, {
			options: this.options
		});
	}
});
