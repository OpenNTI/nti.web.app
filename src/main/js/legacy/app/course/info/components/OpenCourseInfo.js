var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.course.info.components.OpenCourseInfo', {
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

	beforeRender: function () {
		this.addCls((this.enrollmentStatus || 'open').toLowerCase());
		this.renderData = Ext.apply(this.renderData || {}, {
			'heading': getString('course-info.open-course-widget.heading', '', true).replace(/\u200B/ig, ''),
			'message': getString('course-info.open-course-widget.message', '', true).replace(/\u200B/ig, ''),
			'pointfree': getString('course-info.open-course-widget.free-to-anyone', '', true).replace(/\u200B/ig, ''),
			'nocredit': getString('course-info.open-course-widget.not-for-credit', '', true).replace(/\u200B/ig, ''),
			'registered': getString('course-info.open-course-widget.registered', '', true).replace(/\u200B/ig, '')
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

	showEnrollWindow: function () {
		var me = this;
		me.fireEvent('show-enrollment', me.getInfo());
		
		// me.getInfo().fireAcquisitionEvent(me, function(enrolled) {
		//	if (!enrolled) {
		//		me.fireEvent('go-to-library', me);
		//	}
		// });
	}
});
