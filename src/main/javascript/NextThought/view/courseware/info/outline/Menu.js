Ext.define('NextThought.view.courseware.info.outline.Menu', {
	extend: 'Ext.view.View',
	alias: 'widget.course-info-outline-menu',

	//<editor-fold desc="Config">

	ui: 'course-info',
	cls: 'nav-outline static',
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
			scope: this,
			select: 'scrollTo'
		});
	},


	buildStore: function() {
		var i = this.info && this.info.instructors,
			plural = (i && i.length > 1) ? 's' : '';

		if (!this.menuStore) {
			this.menuStore = new Ext.data.Store({
				fields: [
					{ name: 'hash', type: 'string' },
					{ name: 'label', type: 'string' }
				],
				data: [
					{ hash: 'top', label: 'About' },
					{ hash: 'course-info-instructors', label: 'Course Instructor' + plural },
					//{ hash: 'course-info-faq', label: 'Frequently Asked Questions' },
					{ hash: 'course-info-support', label: 'Tech Support' }
				]
			});
		}

		return this.menuStore;
	},


	scrollTo: function(selModel, record) {
		//This is going to be very dirty so that we can just get it done.
		var hash = record.get('hash'),
			ci = this.up('course-info'),
			scrollingThing = ci.down('course-info-panel').getEl(),
			scrollReference = ci.down('course-info-panel').child().getEl(),
			scrollTarget = ci.down(hash),
			scrollTargetY;

		if (hash === 'top') {
			scrollingThing.scrollTo('top', 0, true);
			return;
		}

		if (!scrollTarget) {
			selModel.deselect(record);
			return;
		}

		scrollTargetY = scrollTarget.getEl().getOffsetsTo(scrollReference)[1];
		scrollingThing.scrollTo('top', scrollTargetY, true);
	}

});

