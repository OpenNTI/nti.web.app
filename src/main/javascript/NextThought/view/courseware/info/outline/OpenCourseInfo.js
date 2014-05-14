Ext.define('NextThought.view.courseware.info.outline.OpenCourseInfo', {
	extend: 'Ext.Component',
	alias: 'widget.course-info-outline-open-course',

	//<editor-fold desc="Config">

	ui: 'course-info',
	cls: 'open-course-info',
	renderTpl: Ext.DomHelper.markup([
		{tag: 'tpl', 'if': 'heading || message || pointfree || nocredit', cn: { cls: 'open-info', cn: [
			{tag: 'tpl', 'if': 'heading', cn: { cls: 'heading', html: '{heading}' }},
			{tag: 'tpl', 'if': 'message', cn: { cls: 'content', html: '{message}'}},
			{tag: 'tpl', 'if': 'pointfree || nocredit', cn: { tag: 'ul', cn: [
				{tag: 'tpl', 'if': 'pointfree', cn: { tag: 'li', html: '{pointfree}'}},
				{tag: 'tpl', 'if': 'nocredit', cn: { tag: 'li', cls: 'red', html: '{nocredit}'}}
			] }}
		]}},
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
		this.addCls((this.enrollmentStatus || 'open').toLowerCase());
		this.renderData = Ext.apply(this.renderData || {}, {
			'heading': getString('course-info.open-course-widget.heading', '', true),
			'message': getString('course-info.open-course-widget.message', '', true),
			'pointfree': getString('course-info.open-course-widget.free-to-anyone', '', true),
			'nocredit': getString('course-info.open-course-widget.not-for-credit', '', true),
			'registered': getString('course-info.open-course-widget.registered', '', true)
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
