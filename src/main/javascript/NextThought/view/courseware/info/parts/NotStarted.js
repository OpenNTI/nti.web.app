Ext.define('NextThought.view.courseware.info.parts.NotStarted', {
	extend: 'Ext.Component',
	alias: 'widget.course-info-not-started',

	requires: ['NextThought.view.courseware.info.outline.OpenCourseInfo'],

	ui: 'course-info',

	headerTpl: Ext.DomHelper.createTemplate({ cls: 'course-info-header-bar', cn: [
		{ cls: 'col-left', cn: [
			{ cls: 'label', html: 'Course Starts' },
			{ cls: 'date', html: '{startDate:date("F j, Y")}'}
		] },
		{ cls: 'col-right', cn: [
			{ tag: 'a', cls: 'enroll', html: '{enroll}', href: '{enrollUrl}', target: '_blank'},
			{ cls: 'registered', cn: [
				'{registered}',
				{ tag: 'span', cls: 'edit', html: 'Edit' }
			] }
		] }
	] }),


	config: {
		info: null
	},


	afterRender: function() {
		var i = this.getInfo() || {},
			c = (i.get('Credit') || [])[0],
			e = (c && c.get('Enrollment')) || {},
			data = {},
			el;

		this.callParent(arguments);

		Ext.apply(data || {}, {
			startDate: i.get('StartDate'),
			enroll: 'Enroll for Credit',
			enrollUrl: e.url,
			registered: getString('course-info.description-widget.open-enrolled')
		});

		el = this.headerTpl.insertFirst('course-info', data, true);
		this.mon(el.down('.edit'), 'click', 'showEnrollWindow');

		this.on('destroy', function() {
			Ext.destroy(el);
		});
	}

}, function() {
	this.borrow(NextThought.view.courseware.info.outline.OpenCourseInfo, ['showEnrollWindow']);
});
