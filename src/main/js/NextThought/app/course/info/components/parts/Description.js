Ext.define('NextThought.app.course.info.components.parts.Description', {
	extend: 'Ext.Component',
	alias: 'widget.course-info-description',

	ui: 'course-info',
	cls: 'description-fields',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'body', html: '{description:htmlEncode}' },

		{ cls: 'fields', cn: [
			{ cls: 'row', cn: [
				{ cls: 'cell', cn: [
					{ cls: 'label', html: '{{{NextThought.view.courseware.info.parts.Description.prereqs}}}' },
					{ cls: 'value', cn: { tag: 'tpl', 'for': 'prerequisites', cn: {html: '{.}'}} }
				] },
				{ cls: 'cell', cn: [
					{ cls: 'label', html: '{{{NextThought.view.courseware.info.parts.Description.hours}}}'},
					{ cls: 'value {enrollmentStatus:lowercase}', cn: [

						{ tag: 'tpl', 'if': 'creditHours', cn: {
							cls: 'enroll-for-credit', cn: [
								'{creditHours:plural("Credit")} {{{NextThought.view.courseware.info.parts.Description.available}}}', {tag: 'br'},
								{ tag: 'tpl', 'for': 'credit', cn: [
									'{%' +
										'var e = values.get("Enrollment"); ' +
										'values["enrollUrl"] = e && e.url; ' +
										'values["enrollLabel"] = e && e.label;\n' +
									'%}',
									{ tag: 'a', href: '{enrollUrl}', html: '{enrollLabel}'}, {tag: 'br'}
								] }
							] }
						},

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
					{ cls: 'label', html: '{{{NextThought.view.courseware.info.parts.Description.start}}}'},
					{ cls: 'value', html: '{startDate:date("F j, Y")}' }
				]},
				{ cls: 'cell', cn: [
					{ tag: 'tpl', 'if': 'duration', cn: { cls: 'cell cell1third', cn: [
						{ cls: 'label', html: '{{{NextThought.view.courseware.info.parts.Description.duration}}}'},
						{ cls: 'value', html: '{duration} {durationUnits}' }
					]}},
					{ cls: 'cell cell2thirds', cn: [
						{ cls: 'label', html: '{{{NextThought.view.courseware.info.parts.Description.days}}}'},
						{ cls: 'value', cn: [
							{ tag: 'tpl', 'if': 'days', cn: [
								{ tag: 'span', html: '{days}'},
								{ tag: 'span', html: '{times}'}
							]
							},{ tag: 'tpl', 'if': '!days', cn: '{{{NextThought.view.courseware.info.parts.Description.online}}}' }
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
			p = Ext.Array.pluck(i.get('Prerequisites') || [], 'title'),
			start = Ext.Date.format(i.get('StartDate'), 'Y-m-d');

		function fo(d) {
			var date = Ext.Date.parse([start, d].join('T'), 'c');
			return Ext.Date.format(date, 'g:i a');
		}

		if (p.join() === '') {
			p = [getString('NextThought.view.courseware.info.parts.Description.noprereqs')];
		}

		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			description: i.get('Description'),
			prerequisites: p,
			courseId: i.get('ProviderUniqueID'),
			title: i.get('Title'),
			school: i.get('ProviderDepartmentTitle'),
			schoolLabel: getString('NextThought.view.courseware.info.parts.Description.schoollabel'), //Department
			durationUnits: getString('NextThought.view.courseware.info.parts.Description.durationunits'),
			duration: Math.floor(new Duration(i.get('Duration')).inWeeks()),
			startDate: i.get('StartDate'),
			days: (s.days || []).join('/'),//eww
			times: Ext.Array.map(s.times || [], fo).join(' - '), //eww

			credit: i.get('Credit'),
			creditHours: c && c.get('Hours'),
			//enrollLabel: e.label,
			//enrollUrl: e.url,

			enrollmentStatus: this.enrollmentStatus,

			nocredit: getString('course-info.description-widget.for-no-credit'),
			inopen: getString('course-info.description-widget.open-enrolled')
		});
	}
});
