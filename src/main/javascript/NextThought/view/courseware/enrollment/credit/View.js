Ext.define('NextThought.view.courseware.enrollment.credit.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.enrollment-credit',

	requires: [
		'NextThought.view.courseware.enrollment.credit.Admission'
	],

	layout: 'card',
	cls: 'enrollment-credit',

	getTargetEl: function() {
		return this.body;
	},

	childEls: ['body'],

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', cn: [
			{cls: 'enabled', html: 'Course Details'},
			{cls: 'number enabled active', 'data-number': '1', html: 'Admissions'},
			{cls: 'number', 'data-number': '2', html: 'Enrollment'},
			{cls: 'number', 'data-number': '3', html: 'Purchase'}
		]},
		{ id: '{id}-body', cls: 'body-container credit-container', cn: ['{%this.renderContainer(out,values)%}'] }
	]),


	initComponent: function() {
		this.callParent(arguments);

		this.admissions = this.add({
			xtype: 'enrollment-credit-admission'
		});

		this.getLayout().setActiveItem(this.admissions);
	}
});
