Ext.define('NextThought.view.courseware.info.parts.NotStarted', {
	extend: 'Ext.Component',
	alias: 'widget.course-info-not-started',

	requires: ['NextThought.view.courseware.info.outline.OpenCourseInfo'],

	ui: 'course-info',

	headerTpl: Ext.DomHelper.createTemplate({ cls: 'course-info-header-bar {status}', cn: [
		{ cls: 'col-left', cn: [
			{ cls: 'label', html: getString('NextThought.view.courseware.info.parts.NotStarted.starts') },
			{ cls: 'date', html: '{startDate:date("F j, Y")}'}
		] },
		{ cls: 'col-right', cn: [
			{ tag: 'a', cls: 'enroll', html: '{enroll}', href: '{enrollUrl}', target: '_blank'},
			{ cls: 'registered', cn: [
				'{registered}',
				{ tag: 'span', cls: 'edit', html: getString('NextThought.view.courseware.info.parts.NotStarted.edit') }
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
			registeredText,
			el;

		this.callParent(arguments);

		registeredText = CourseWareUtils.Enrollment.getEnrolledText(i);

		Ext.apply(data || {}, {
			startDate: i.get('StartDate'),
			status: this.enrollmentStatus,
			enroll: getString('NextThought.view.courseware.info.parts.NotStarted.notenrolled'),
			enrollUrl: e.url,
			registered: registeredText || ''
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
