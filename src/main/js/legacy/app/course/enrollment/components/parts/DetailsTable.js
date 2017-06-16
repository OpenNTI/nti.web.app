const Ext = require('extjs');
const Duration = require('durationjs');

module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.parts.DetailsTable', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-details-table',


	cls: 'enrollment-details-table',

	renderTpl: Ext.DomHelper.markup({cls: 'info', cn: [
		{cls: 'line', cn: [
				{cls: 'course-number', html: '{number}'},
				{cls: 'title', html: '{title}'},
				{cls: 'instructor', html: 'instructed by {instructor}'},
				{cls: 'enroll-now', html: '{price}'}
		]},
		{tag: 'tpl', 'if': 'showCredit', cn: {
			cls: 'line course-info', cn: [
				{cls: 'field long', cn: [
						{cls: 'name', html: 'prerequisites'},
					{tag: 'tpl', 'for': 'prereqs', cn: [
							{cls: 'value', html: '{title}'}
					]}
				]},
				{cls: 'field medium green', cn: [
						{cls: 'name', html: 'credit hours'},
						{cls: 'value green', html: '{credit}'}
				]}
			]
		}},
		{cls: 'line course-info', cn: [
			{cls: 'field long', cn: [
					{cls: 'name', html: '{number}'},
					{cls: 'value', html: '{title}'}
			]},
			{cls: 'field medium', cn: [
					{cls: 'name', html: 'school'},
					{cls: 'value', html: '{school}'}
			]}
		]},
		{tag: 'tpl', 'if': 'start || end || duration', cn: [
			{cls: 'line course-info', cn: [
				{tag: 'tpl', 'if': 'start', cn: [
					{cls: 'field fourth', cn: [
							{cls: 'name', html: 'start date'},
							{cls: 'value', html: '{start}'}
					]},
				]},
				{tag: 'tpl', 'if': 'end', cn: [
					{cls: 'field fourth', cn: [
							{cls: 'name', html: 'end date'},
							{cls: 'value', html: '{end}'}
					]},
				]},
				{tag: 'tpl', 'if': 'duration', cn: [
					{cls: 'field fourth', cn: [
							{cls: 'name', html: 'duration'},
							{cls: 'value', html: '{duration}'}
					]}
				]}

					// {cls: 'field fourth', cn: [
					//	{cls: 'name', html: 'course type'},
					//	{cls: 'value', html: '{type}'}
					// ]}
			]}
		]}
	]}),


	beforeRender: function () {
		this.callParent(arguments);

		var c = this.course, showCredit = false,
			duration = c.get('Duration'),
			credit = c.get('Credit') && c.get('Credit')[0],
			prereqs = c.get('Prerequisites'),
			instructors = c.get('Instructors')[0];

		showCredit = credit && !Ext.isEmpty(prereqs);

		duration = duration && new Duration(duration);

		this.renderData = Ext.apply(this.renderData || {}, {
			price: this.getPrice(),
			number: c.get('ProviderUniqueID'),
			title: c.get('Title'),
			instructor: instructors.get('Name'),
			showCredit: showCredit,
			prereqs: prereqs,
			credit: credit ? credit.get('Hours') + ' credit hours available' : 'No credit hours available',
			start: Ext.Date.format(c.get('StartDate'), 'F j, Y'),
			end: Ext.Date.format(c.get('EndDate'), 'F j, Y'),
			school: c.get('ProviderDepartmentTitle'),
			duration: duration && duration.inWeeks() > 0 ? Math.floor(duration.inWeeks()) + ' Weeks' : null,
			type: 'Fully Online'
		});
	},


	getPrice: function () {
		var pricing = this.enrollmentOption.pricing;

		if (pricing) {
			return '$' + pricing.get('PurchasePrice');
		}

		return '$' + (this.enrollmentOption.OU_Price || this.enrollmentOption.Price);
	}
});
