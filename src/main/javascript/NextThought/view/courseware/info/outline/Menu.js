Ext.define('NextThought.view.courseware.info.outline.Menu', {
	extend: 'Ext.view.View',
	alias: 'widget.course-info-outline-menu',

	//<editor-fold desc="Config">

	ui: 'course-info',
	cls: 'nav-outline static',
	preserveScrollOnRefresh: true,

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', cn: [
			'{{{NextThought.view.courseware.info.outline.Menu.header}}}'
		]},
		{ cls: 'outline-menu'}
	]),

	config: {
		info: null
	},

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
			select: 'view'
		});
	},


	buildStore: function() {
		var ifo = this.getInfo(),
			i = ifo && ifo.get('Instructors'),
			plural = (i && i.length > 1) ? 's' : '';//this is wrong way to go about it

		if (!this.menuStore) {
			this.menuStore = new Ext.data.Store({
				fields: [
					{ name: 'hash', type: 'string' },
					{ name: 'label', type: 'string' },
					{ name: 'view', type: 'string', defaultValue: 'info' }
				],
				data: [
					{ hash: 'top', label: 'About' },
					{ hash: 'course-info-instructors', label: getFormattedString('NextThought.view.courseware.info.outline.Menu.courseinstructors', {
						instructor: Ext.util.Format.plural(i.length, 'Instructor', true)
					}) },
					//{ hash: 'course-info-faq', label: 'Frequently Asked Questions' },
					{ hash: 'course-info-support', label: getString('NextThought.view.courseware.info.outline.Menu.support') },
					{ hash: 'top', view: 'roster', label: getString('NextThought.view.courseware.info.outline.Menu.roster')}
				]
			});

			if (!this.showRoster) {
				this.menuStore.filter({
					property: 'view',
					value: 'info'
				});
			}
		}

		return this.menuStore;
	},


	scrollTo: function(selModel, record) {
		//This is going to be very dirty so that we can just get it done.
		var hash = (record && record.get('hash')) || 'top',
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
	},


	view: function(selModel, rec) {
		var viewId = rec.get('view'),
			ci = this.up('course-info'),
			current = ci.body.getLayout().getActiveItem();
		if (current && current.itemId === viewId) {
			if (viewId === 'info') {
				this.scrollTo(selModel, rec);
			}
			return;
		}

		//switch!
		ci.body.getLayout().setActiveItem(viewId);
		this.scrollTo(selModel, rec);//scroll the course info up
	}

});

