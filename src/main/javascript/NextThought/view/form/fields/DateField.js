Ext.define('NextThought.view.form.fields.DateField', {
	extend: 'Ext.Component',
	alias: 'widget.datefield',

	requires: ['NextThought.view.form.fields.SearchComboBox'],

	cls: 'datefield',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'month'},
		{tag: 'input', cls: 'day date-field-input', placeholder: 'Day'},
		{tag: 'input', cls: 'year date-field-input', placeholder: 'Year'}
	]),

	renderSelectors: {
		monthEl: '.month',
		dayEl: '.day',
		yearEl: '.year'
	},


	afterRender: function() {
		this.callParent(arguments);


		this.monthInput = Ext.widget('searchcombobox', {
			options: [
				{value: '01', text: 'January'},
				{value: '02', text: 'February'},
				{value: '03', text: 'March'},
				{value: '04', text: 'April'},
				{value: '05', text: 'May'},
				{value: '06', text: 'June'},
				{value: '07', text: 'July'},
				{value: '08', text: 'August'},
				{value: '09', text: 'September'},
				{value: '10', text: 'October'},
				{value: '11', text: 'November'},
				{value: '12', text: 'December'}
			],
			emptyText: 'Month',
			renderTo: this.monthEl
		});

		this.on('destroy', 'destroy', this.monthInput);
	},


	getValue: function() {
		var year = this.yearEl.getValue(),
			day = this.dayEl.getValue();
			month = this.monthInput.getValue();

		return year + month + day;
	}
});
