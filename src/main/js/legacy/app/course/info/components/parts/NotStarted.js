const Ext = require('extjs');

const {getString} = require('legacy/util/Localization');
const EnrollmentStateStore = require('legacy/app/course/enrollment/StateStore');

const OpenCourseInfo = require('../OpenCourseInfo');


module.exports = exports = Ext.define('NextThought.app.course.info.components.parts.NotStarted', {
	extend: 'Ext.Component',
	alias: 'widget.course-info-not-started',
	ui: 'course-info',

	renderTpl: Ext.DomHelper.createTemplate({ cls: 'course-info-header-bar {status}', cn: [
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

	renderSelectors: {
		editLink: '.edit'
	},

	beforeRender: function () {
		var i = this.getInfo() || {},
			c = (i.get('Credit') || [])[0],
			e = (c && c.get('Enrollment')) || {},
			registeredText;

		this.EnrolledStateStore = EnrollmentStateStore.getInstance();

		registeredText = this.EnrolledStateStore.getEnrolledText(i);

		this.renderData = Ext.apply(this.renderData || {}, {
			startDate: i.get('StartDate'),
			status: this.enrollmentStatus,
			enroll: getString('NextThought.view.courseware.info.parts.NotStarted.notenrolled'),
			enrollUrl: e.url,
			registered: registeredText || ''
		});

		this.enableBubble(['show-enrollment']);

		this.on({
			editLink: {
				click: {
					fn: 'showEnrollWindow',
					scope: this
				}
			}
		});

	}
}, function () {
	this.borrow(OpenCourseInfo, ['showEnrollWindow']);
});
