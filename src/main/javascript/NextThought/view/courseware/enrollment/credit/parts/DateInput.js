Ext.define('NextThought.view.courseware.enrollment.credit.parts.DateInput', {
	extend: 'NextThought.view.courseware.enrollment.credit.parts.BaseInput',
	alias: 'widget.credit-dateinput',

	requires: ['NextThought.view.form.fields.DateField'],

	renderTpl: Ext.DomHelper.markup({
		cls: 'credit-input date-input full'
	}),

	renderSelectors: {
		dateEl: '.date-input'
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this,
			scrollParent = me.el.parent('.credit-container');

		me.dateInput = Ext.widget('datefield', {
			renderTo: me.dateEl
		});

		me.on('destroy', 'destroy', me.dateInput);

		me.mon(scrollParent, 'scroll', function() {
			me.dateInput.monthInput.hideOptions();
		});
	},


	isEmpty: function() {
		return this.getValue();
	},


	getValue: function() {
		var value = {};

		value[this.name] = this.dateInput.getValue();
		return value;
	}
});
