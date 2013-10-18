Ext.define('NextThought.view.course.info.parts.Support', {
	extend: 'Ext.Component',
	alias: 'widget.course-info-support',

	//<editor-fold desc="Config">
	ui: 'course-info',
	cls: 'course-info-support',
	renderTpl: Ext.DomHelper.markup([
		{ cls: 'photo', style: {backgroundImage:'url({photo})'}},
		{ cls: 'wrap', cn: [
			{ cls: 'label', html: 'Tech Support' },
			{ cls: 'phone', html: '{phone}'},
			{ tag: 'tpl', 'for':'links', cn: [
				{ cn: { tag: 'a', cls: 'link', html: '{Label}', href: '{URL}', target: '_blank'}}
			]}

		] }
	]),

	beforeRender: function(){

		this.renderData = Ext.apply(this.renderData||{},{
			photo: getString('course-info.course-supoprt.photo'),
			phone: getString('course-info.course-supoprt.phone'),
			links: [
				{
					Label: getString('course-info.course-supoprt.link1.Label'),
					URL: getString('course-info.course-supoprt.link1.URL')
				},{
					Label: getString('course-info.course-supoprt.link2.Label'),
					URL: getString('course-info.course-supoprt.link2.URL')
				},{
					Label: getString('course-info.course-supoprt.link3.Label'),
					URL: getString('course-info.course-supoprt.link3.URL')
				}
			]
		});

		return this.callParent(arguments);
	}
	//</editor-fold>
});
