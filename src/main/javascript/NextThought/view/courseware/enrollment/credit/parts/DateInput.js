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

		this.dateInput = Ext.widget('datefield', {
			renderTo: this.dateEl
		});

		this.on('destroy', 'destroy', this.dateInput);
	}
});
