const Ext = require('@nti/extjs');

const { getString } = require('legacy/util/Localization');

module.exports = exports = Ext.define(
	'NextThought.app.course.info.components.OpenCourseInfo',
	{
		extend: 'Ext.Component',
		alias: 'widget.course-info-outline-open-course',

		//<editor-fold desc="Config">

		ui: 'course-info',
		cls: 'open-course-info',
		renderTpl: Ext.DomHelper.markup([
			{
				cls: 'foot',
				cn: [
					{ cls: 'edit', html: 'Edit' },
					{ cls: 'registered', html: '{registered}' },
				],
			},
		]),

		config: {
			info: null,
		},

		renderSelectors: {
			editLink: '.edit',
		},

		beforeRender: function () {
			const credits = this.info && this.info.get('awardable_credits');

			let noCreditMsg = getString(
				'course-info.open-course-widget.not-for-credit',
				'',
				true
			).replace(/\u200B/gi, '');

			if (credits && credits.length > 0) {
				noCreditMsg = null;
			}

			this.addCls((this.enrollmentStatus || 'open').toLowerCase());
			this.renderData = Ext.apply(this.renderData || {}, {
				heading: getString(
					'course-info.open-course-widget.heading',
					'',
					true
				).replace(/\u200B/gi, ''),
				message: getString(
					'course-info.open-course-widget.message',
					'',
					true
				).replace(/\u200B/gi, ''),
				pointfree: getString(
					'course-info.open-course-widget.free-to-anyone',
					'',
					true
				).replace(/\u200B/gi, ''),
				nocredit: noCreditMsg,
				registered: getString(
					'course-info.open-course-widget.registered',
					'',
					true
				).replace(/\u200B/gi, ''),
			});

			this.on({
				editLink: {
					click: {
						fn: 'showEnrollWindow',
						scope: this,
					},
				},
			});

			return this.callParent(arguments);
		},

		//</editor-fold>

		showEnrollWindow: function () {
			var me = this;
			me.fireEvent('show-enrollment', me.getInfo());

			// me.getInfo().fireAcquisitionEvent(me, function(enrolled) {
			//	if (!enrolled) {
			//		me.fireEvent('go-to-library', me);
			//	}
			// });
		},
	}
);
