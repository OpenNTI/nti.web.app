Ext.define('NextThought.view.courseware.info.outline.OpenCourseInfo', {
	extend: 'Ext.Component',
	alias: 'widget.course-info-outline-open-course',

	//<editor-fold desc="Config">

	ui: 'course-info',
	cls: 'open-course-info',
	renderTpl: Ext.DomHelper.markup([
		{ cls: 'open-info', cn: [
			{ cls: 'heading', html: '{heading}' },
			{ cls: 'content', html: '{message}'},
			{ tag: 'ul', cn: [
				{ tag: 'li', html: '{pointfree}'},
				{ tag: 'li', cls: 'red', html: '{nocredit}'}
			] }
		]},
		{ cls: 'foot', cn: [
			{ cls: 'edit', html: 'Edit'},
			{ cls: 'registered', html: '{registered}' }
		] }
	]),

	config: {
		info: null
	},

	renderSelectors: {
		editLink: '.edit'
	},

	beforeRender: function() {
		this.addCls(this.enrollmentStatus || 'open');
		this.renderData = Ext.apply(this.renderData || {}, {
			'heading': getString('course-info.open-course-widget.heading'),
			'message': getString('course-info.open-course-widget.message'),
			'pointfree': getString('course-info.open-course-widget.free-to-anyone'),
			'nocredit': getString('course-info.open-course-widget.not-for-credit'),
			'registered': getString('course-info.open-course-widget.registered')
		});

		this.on({
			editLink: {
				click: {
					fn: 'showEnrollWindow',
					scope: this
				}
			}
		});

		return this.callParent(arguments);
	},

	//</editor-fold>

	showEnrollWindow: function() {
		var me = this;
		me.getInfo().fireAcquisitionEvent(me, function(enrolled) {
			if (!enrolled) {
				me.fireEvent('go-to-library', me);
			}
		});
	}
});
