Ext.define('NextThought.view.course.info.outline.Menu',{
	extend: 'Ext.view.View',
	alias: 'widget.course-info-outline-menu',

	//<editor-fold desc="Config">

	ui: 'course-info',
	cls: 'nav-outline',
	preserveScrollOnRefresh: true,

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', cn: [
			'Course Info'
		]},
		{ cls: 'outline-menu'}
	]),

	renderSelectors: {
		frameBodyEl: '.outline-menu'
	},


	getTargetEl: function() {
		return this.frameBodyEl;
	},


	overItemCls: 'over',
	itemSelector: '.outline-row',
	tpl: new Ext.XTemplate(Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
		{ cls: 'outline-row', cn: [
			{cls: 'label', html: '{label}'}
		]}
	]})),
	//</editor-fold>

	initComponent: function() {
		this.callParent(arguments);
		this.bindStore(this.buildStore());
		this.getSelectionModel().select(0);
		this.on({
				select: function(s, r) {
				}
			});
	},


	buildStore: function() {
		return this.menuStore || (this.menuStore = new Ext.data.Store({
			fields: [
				{ name: 'hash', type: 'string' },
				{ name: 'label', type: 'string' }
			],
			data: [
				{ hash: 'top', label: 'About' },
				{ hash: 'course-info-instructors', label: 'Course Instructors' },
				{ hash: 'course-info-faq', label: 'Frequently Asked Questions' },
				{ hash: 'course-info-support', label: 'Tech Support' }
			]
		}));
	}

});

