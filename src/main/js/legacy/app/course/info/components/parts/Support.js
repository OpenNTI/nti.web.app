const Ext = require('@nti/extjs');

const {getString} = require('legacy/util/Localization');


module.exports = exports = Ext.define('NextThought.app.course.info.components.parts.Support', {
	extend: 'Ext.Component',
	alias: 'widget.course-info-support',

	//<editor-fold desc="Config">
	ui: 'course-info',
	cls: 'course-info-support',
	renderTpl: Ext.DomHelper.markup([
		{ cls: 'photo' },
		{ cls: 'wrap', cn: [
			{ cls: 'label', html: '{{{NextThought.view.courseware.info.parts.Support.support}}}' },
			{ cls: 'phone', html: '{phone}'},
			{ tag: 'tpl', 'for': 'links', cn: [
				{ tag: 'tpl', 'if': 'URL', cn:
					{ cn: { tag: 'a', cls: 'link', html: '{Label}', href: '{URL}', target: '_blank'}}}
			]}

		] }
	]),

	beforeRender: function () {

		function clean (i) {
			return i && (!Ext.isEmpty(i.Label) || !Ext.isEmpty(i.URL));
		}

		this.renderData = Ext.apply(this.renderData || {}, {
			phone: getString('course-info.course-supoprt.phone', null, true),
			links: [
				{
					Label: getString('course-info.course-supoprt.link1.Label', 'support@nextthought.com', true),
					URL: getString('course-info.course-supoprt.link1.URL', 'mailto:support@nextthought.com', true)
				},{
					Label: getString('course-info.course-supoprt.link2.Label', null, true),
					URL: getString('course-info.course-supoprt.link2.URL', null, true)
				},{
					Label: getString('course-info.course-supoprt.link3.Label', null, true),
					URL: getString('course-info.course-supoprt.link3.URL', null, true)
				},
				{
					Label: getString('course-info.course-support.help-site.Label', null, true),
					URL: getString('course-info.course-support.help-site.URL', null, true)
				}
			].filter(clean)
		});

		return this.callParent(arguments);
	}
	//</editor-fold>
});
