Ext.define('NextThought.view.courseware.info.parts.Description',{
	extend: 'Ext.Component',
	alias: 'widget.course-info-description',

	ui: 'course-info',
	cls: 'description-fields',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'body', html: '{description:htmlEncode}' },

		{ cls: 'fields', cn: [
			{ cls: 'row', cn: [
				{ cls: 'cell', cn: [
					{ cls: 'label', html: 'Prerequisites' },
					{ cls: 'value', cn: { tag: 'tpl', 'for': 'prerequisites', cn: {html: '{.}'}} }
				] },
				{ cls: 'cell', cn: [
					{ cls: 'label', html: 'Credit Hours'},
					{ cls: 'value', cn: [
						{ tag: 'tpl', 'if': 'creditHours', cn: {
							cls: 'enroll-for-credit', cn: [
								'{creditHours:plural("Credit")} Available. ',
								{ tag: 'a', target: '_blank', href: '{enrollUrl}', html: '{enrollLabel}'}
							] } },
						{ cls: 'open', cn: [
							'{inopen} ', { cls: 'red', tag: 'span', html: '{nocredit}' }
						] }
					] }
				] }
			]},
			{ cls: 'row', cn: [
				{ cls: 'cell', cn: [
					{ cls: 'label', html: '{courseId}'},
					{ cls: 'value', html: '{title}' }
				]},
				{ cls: 'cell', cn: [
					{ cls: 'label', html: '{schoolLabel}'},
					{ cls: 'value', html: '{school}' }
				]}
			]},
			{ cls: 'row', cn: [
				{ cls: 'cell', cn: [
					{ cls: 'label', html: 'Start Date'},
					{ cls: 'value', html: '{startDate:date("F j, Y")}' }
				]},
				{ cls: 'cell', cn: [
					{ tag: 'tpl', 'if': 'duration', cn: { cls: 'cell cell1third', cn: [
						{ cls: 'label', html: 'Duration'},
						{ cls: 'value', html: '{duration} {durationUnits}' }
					]}},
					{ cls: 'cell cell2thirds', cn: [
						{ cls: 'label', html: 'Day &amp; Time'},
						{ cls: 'value', cn: [
							{ tag: 'tpl', 'if': 'days', cn: [
								{ tag: 'span', html: '{days}'},
								{ tag: 'span', html: '{times}'}
							]
							},{ tag: 'tpl', 'if': '!days', cn: 'Fully Online' }
						] }
					]}
				] }
			]}
		] }
	]),

	config: {
		info: null
	},

	beforeRender: function() {
		var i = this.getInfo() || {get: Ext.emptyFn},
			s = i.get('Schedule') || {},
			c = (i.get('Credit') || [])[0],
			e = (c && c.get('Enrollment')) || {},
			p = Ext.Array.pluck(i.prerequisites || [], 'title'),
			start = Ext.Date.format(i.get('StartDate'), 'Y-m-d');

		function fo(d) {
			var date = Ext.Date.parse([start, d].join('T'), 'c');
			return Ext.Date.format(date, 'g:i a');
		}

		if (p.join() === '') {
			p = ['There are no prerequisites for this course.'];
		}

		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			description: i.get('Description'),
			prerequisites: p,
			courseId: i.getId(),
			title: i.get('Title'),
			school: i.get('ProviderDepartmentTitle'),
			schoolLabel: 'School / Department', //Department
			durationUnits: 'Weeks',
			duration: new Duration(i.get('Duration')).inWeeks(),
			startDate: i.get('StartDate'),
			days: (s.days || []).join('/'),//eww
			times: Ext.Array.map(s.times || [], fo).join(' - '), //eww
			creditHours: c && c.get('Hours'),
			enrollLabel: e.label,
			enrollUrl: e.url,

			nocredit: getString('course-info.description-widget.for-no-credit'),
			inopen: getString('course-info.description-widget.open-enrolled')
		});
	}
});
