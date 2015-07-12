Ext.define('NextThought.app.course.info.components.parts.NotStarted', {
	extend: 'Ext.Component',
	alias: 'widget.course-info-not-started',

	requires: [
		'NextThought.app.course.info.components.OpenCourseInfo',
		'NextThought.app.course.enrollment.StateStore'
	],

	ui: 'course-info',

	renderTpl: Ext.DomHelper.createTemplate({ cls: 'course-info-header-bar {status}', cn: [
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


	beforeRender: function() {
		var i = this.getInfo() || {},
			c = (i.get('Credit') || [])[0],
			e = (c && c.get('Enrollment')) || {},
			data = {},
			registeredText;

		this.EnrolledStateStore = NextThought.app.course.enrollment.StateStore.getInstance();

		registeredText = this.EnrolledStateStore.getEnrolledText(i);

		this.renderData = Ext.apply(this.renderData || {}, {
			startDate: i.get('StartDate'),
			status: this.enrollmentStatus,
			enroll: getString('NextThought.view.courseware.info.parts.NotStarted.notenrolled'),
			enrollUrl: e.url,
			registered: registeredText || ''
		});
	}

}, function() {
	this.borrow(NextThought.app.course.info.components.OpenCourseInfo, ['showEnrollWindow']);
});
