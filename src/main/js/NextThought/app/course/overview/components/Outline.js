Ext.define('NextThought.app.course.overview.components.Outline', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.course-outline',

	requires: [
		'NextThought.app.course.overview.components.outline.OutlineNode',
		'NextThought.model.courses.navigation.CourseOutlineNode'
	],

	ui: 'course',
	cls: 'nav-outline course scrollable',

	items: [
		{xtype: 'box', autoEl: {cls: 'header', html: 'Outline'}},
		{xtype: 'container', cls: 'outline-list', bodyContainer: true, layout: 'none', items: []}
	],


	afterRender: function() {
		this.callParent(arguments);

		var body = this.getBodyContainer();

		this.mon(body.el, 'scroll', this.onScroll.bind(this));
	},


	onScroll: function() {
		var body = this.getBodyContainer(),
			bodyRect = body && body.el && body.el.dom && body.el.dom.getBoundingClientRect(),
			selected = this.el.dom.querySelector('.outline-row.selected'),
			selectedRect = selected && selected.getBoundingClientRect();

		if (selectedRect.top < bodyRect.top || selectedRect.bottom > bodyRect.bottom) {
			selected.classList.add('out-of-view');
		} else {
			selected.classList.remove('out-of-view');
		}
	},


	getBodyContainer: function() {
		return this.down('[bodyContainer]');
	},


	setOutline: function(bundle, outline) {
		var catalog = bundle.getCourseCatalogEntry();

		this.activeBundle = bundle;
		this.shouldShowDates = !catalog.get('DisableOverviewCalendar');
		this.setCollection(outline);
	},


	getCmpForRecord: function(record) {
		if (record instanceof NextThought.model.courses.navigation.CourseOutlineNode) {
			return NextThought.app.course.overview.components.outline.OutlineNode.create({
				outlineNode: record,
				shouldShowDates: this.shouldShowDates
			});
		}

		console.warn('Unknown type: ', record);
	},


	selectRecord: function(record) {
		var body = this.getBodyContainer();

		this.selectedRecord = record;

		body.items.each(function(item) {
			item.selectRecord(record);
		});

		return record;
	},


	getActiveItem: function() {
		return this.selectedRecord;
	}
});

// Ext.define('NextThought.app.course.overview.components.Outline', {
// 	extend: 'Ext.view.View',
// 	alias: 'widget.course-outline',

// 	mixins: {
// 		'EllipsisText': 'NextThought.mixins.EllipsisText'
// 	},

// 	ui: 'course',
// 	cls: 'nav-outline scrollable',
// 	preserveScrollOnRefresh: true,

// 	renderTpl: Ext.DomHelper.markup([
// 		{ cls: 'header', cn: [
// 			'Outline'
// 		]},
// 		{ cls: 'outline-list'}
// 	]),

// 	renderSelectors: {
// 		frameBodyEl: '.outline-list'
// 	},


// 	getTargetEl: function() {
// 		return this.frameBodyEl;
// 	},


// 	overItemCls: 'over',
// 	itemSelector: '.outline-row',
// 	tpl: new Ext.XTemplate(Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
// 		{ cls: 'outline-row {type} {isAvailable:boolStr("","disabled")}', 'data-qtip': '{label:htmlEncode}', cn: [
// 			{cls: 'label', html: '{label}'},
// 			{tag: 'tpl', 'if': 'this.shouldShowDate(values)', cn: {cls: 'date', cn: [
// 				{html: '{startDate:date("M")}'},
// 				{html: '{startDate:date("j")}'}
// 			]}}
// 		]}
// 	]}), {
// 		shouldShowDate: function(values) {
// 			return this.allowDates && values.startDate;
// 		}
// 	}),


// 	listeners: {
// 		itemclick: function() {
// 			this.fromClick = true;
// 		},
// 		beforeselect: function(s, r) {
// 			var pass = r && (r.get('type') !== 'unit' && Boolean(r.get('isAvailable'))),
// 				store = s.getStore(),
// 				last = s.lastSelected || store.first(), next;

// 			if (this.fromKey && !pass) {
// 				last = store.indexOf(last);
// 				next = store.indexOf(r);
// 				next += ((next - last) || 1);

// 				//do the in the next event pump
// 				wait()
// 					.then(s.select.bind(s, next));
// 			}
// 			return pass;

// 		},
// 		select: function(s, r) {
// 			this.fireEvent('select-lesson', r);

// 			// if (this.fromClick || this.fromKey) {
// 			// 	this.fireEvent('select-lesson', r);
// 			// }
// 			// delete this.fromClick;
// 			// delete this.fromKey;
// 		}
// 	},

// 	initComponent: function() {
// 		this.callParent(arguments);
// 		this.on('refresh', 'truncateLabels', this);
// 		this.on('select', 'truncateLabels', this);
// 	},


// 	beforeRender: function() {
// 		this.callParent();
// 		var me = this, s = this.getSelectionModel();
// 		if (!s) {
// 			Ext.log.error('No selection model!');
// 			return;
// 		}
// 		s.onNavKey = Ext.Function.createInterceptor(s.onNavKey, function() {
// 			me.fromKey = true;
// 		});
// 	},


// 	afterRender: function() {
// 		this.callParent(arguments);
// 		this.mon(this.frameBodyEl, 'scroll', 'handleScrolling');
// 		if (Ext.is.iOS) {
// 			Ext.apply(this, {overItemCls: ''});
// 		}
// 	},


// 	truncateLabels: function() {
// 		var me = this;

// 		if (!me.el) {
// 			me.onceRendered.then(me.truncateLabels.bind(me));
// 			return;
// 		}

// 		wait(100).then(function() {
// 			var labels = me.el.select('.outline-row .label');
// 			labels.each(function(label) {
// 				me.truncateText(label.dom, null, true);
// 			});
// 		});
// 	},


// 	handleScrolling: function() {
// 		var selected = this.getSelectedNodes()[0],
// 			selectedEl = Ext.get(selected);

// 		if (selectedEl && this.frameBodyEl) {
// 			if (selectedEl.getY() < this.frameBodyEl.getY()) {
// 				selectedEl.addCls('out-of-view');
// 			} else {
// 				selectedEl.removeCls('out-of-view');
// 			}
// 		}
// 	},


// 	clear: function() {
// 		this.bindStore('ext-empty-store');
// 	},


// 	setOutlineContents: function(bundle, outline) {

// 	},


// 	setNavigationStore: function(bundle, store) {
// 		if (bundle === this.currentBundle && store === this.store) {
// 			return;
// 		}

// 		var me = this,
// 			catalog = bundle.getCourseCatalogEntry(),
// 			shouldShowDates = catalog && !catalog.get('DisableOverviewCalendar');

// 		function bindStore() {
// 			me.bindStore(store);

// 			wait().then(me.refresh.bind(me));
// 		}

// 		this.currentBundle = bundle;

// 		if (me.store !== store) {
// 			me.tpl.allowDates = shouldShowDates;

// 			me.clear();

// 			if (!store.onceBuilt) {
// 				bindStore();
// 			} else {
// 				store.onceBuilt().then(bindStore);
// 			}
// 		}
// 	},


// 	selectRecord: function(record) {
// 		if (typeof record === 'number' && isFinite(record)) {
// 			record = this.store.getAt(record);
// 		}

// 		this.getSelectionModel().select(record, false, true);

// 		return record;
// 	},


// 	getActiveItem: function() {
// 		return this.getSelectionModel().getSelection()[0];
// 	}
// });
