Ext.define('NextThought.view.course.info.parts.Description',{
	extend: 'Ext.Component',
	alias: 'widget.course-info-description',

	ui: 'course-info',
	cls: 'description-fields',

	renderTpl: Ext.DomHelper.markup([
		{ cls:'body', html: '{description:htmlEncode}' },

		{ cls:'fields', cn:[
			{ cls: 'row', cn:[
				{ cls: 'cell', cn: [
					{ cls: 'label', html: 'Prerequisites' },
					{ cls: 'value', html: 'There are no prerequisites for this course' }
				] },
				{ cls: 'cell', cn: [
					{ cls: 'label', html: 'Credit Hours'},
					{ cls: 'value', cn: [
						{ cls: 'enroll-for-credit', cn: [
							'{creditHours:plural("Credit")} Available. ',
							{ tag: 'a', target:'_blank', href: '{enrollUrl}', html: '{enrollLabel}'}
						] },
						{ cls: 'open', cn:[
							'{inopen} ', { cls:'red', tag:'span', html:'{nocredit}' }
						] }
					] }
				] }
			]},
			{ cls: 'row', cn:[
				{ cls: 'cell', cn: [
					{ cls: 'label', html: '{courseId}'},
					{ cls: 'value', html: '{title}' }
				]  },
				{ cls: 'cell', cn: [
					{ cls: 'label', html: '{schoolLabel}'},
					{ cls: 'value', html: '{school}' }
				]  }
			]},
			{ cls: 'row', cn:[
				{ cls: 'cell', cn: [
					{ cls: 'label', html: 'Start Date'},
					{ cls: 'value', html: '{startDate:date("M j, Y")}' }
				]  },
				{ cls:'cell', cn: [
					{ cls: 'cell cell1third', cn: [
						{ cls: 'label', html: 'Duration'},
						{ cls: 'value', html: '{duration}' }
					]  },
					{ cls: 'cell cell2thirds', cn: [
						{ cls: 'label', html: 'Day &amp; Time'},
						{ cls: 'value', html: '{days} {times}' }
					]  }
				] }
			]}
		] }
	]),


	beforeRender: function(){
		var i = this.info || {},
			s = i.schedule || {},
			c = (i.credit || [])[0],
			e = c.enrollment || {};

		function fo(d){
			return Ext.Date.format(d,'g:i a');
		}

		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData||{},{
			description: i.description,
			courseId: i.id,
			title: i.title,
			school: i.school,
			schoolLabel: 'School', //Department
			duration: i.duration,
			startDate: i.startDate,
			days: (s.days||[]).join('/'),//eww
			times: Ext.Array.map(s.times||[],fo).join(' - '), //eww
			creditHours: c.hours,
			enrollLabel: e.label,
			enrollUrl: e.url,

			nocredit: getString('course-info.description-widget.for-no-credit'),
			inopen: getString('course-info.description-widget.open-enrolled')
		});
	}
});
