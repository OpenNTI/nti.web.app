Ext.define('NextThought.app.course.overview.components.Outline', {
	extend: 'Ext.view.View',
	alias: 'widget.course-outline',

	mixins: {
		'EllipsisText': 'NextThought.mixins.EllipsisText'
	},

	ui: 'course',
	cls: 'nav-outline scrollable',
	preserveScrollOnRefresh: true,

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', cn: [
			'Outline'
		]},
		{ cls: 'outline-list'}
	]),

	renderSelectors: {
		frameBodyEl: '.outline-list'
	},


	getTargetEl: function() {
		return this.frameBodyEl;
	},


	overItemCls: 'over',
	itemSelector: '.outline-row',
	tpl: new Ext.XTemplate(Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
		{ cls: 'outline-row {type} {isAvailable:boolStr("","disabled")}', 'data-qtip': '{label:htmlEncode}', cn: [
			{cls: 'label', html: '{label}'},
			{tag: 'tpl', 'if': 'this.shouldShowDate(values)', cn: {cls: 'date', cn: [
				{html: '{startDate:date("M")}'},
				{html: '{startDate:date("j")}'}
			]}}
		]}
	]}), {
		shouldShowDate: function(values) {
			return this.allowDates && values.startDate;
		}
	}),


	listeners: {
		itemclick: function() {
			this.fromClick = true;
		},
		beforeselect: function(s, r) {
			var pass = r && (r.get('type') !== 'unit' && Boolean(r.get('NTIID'))),
				store = s.getStore(),
				last = s.lastSelected || store.first(), next;

			if (this.fromKey && !pass) {
				last = store.indexOf(last);
				next = store.indexOf(r);
				next += ((next - last) || 1);

				//do the in the next event pump
				wait()
					.then(s.select.bind(s, next));
			}
			return pass;

		},
		select: function(s, r) {
			this.fireEvent('select-lesson', r);

			// if (this.fromClick || this.fromKey) {
			// 	this.fireEvent('select-lesson', r);
			// }
			// delete this.fromClick;
			// delete this.fromKey;
		}
	},

	initComponent: function() {
		this.callParent(arguments);
		this.on('refresh', 'truncateLabels', this);
		this.on('select', 'truncateLabels', this);
	},


	beforeRender: function() {
		this.callParent();
		var me = this, s = this.getSelectionModel();
		if (!s) {
			Ext.log.error('No selection model!');
			return;
		}
		s.onNavKey = Ext.Function.createInterceptor(s.onNavKey, function() {
			me.fromKey = true;
		});
	},


	afterRender: function() {
		this.callParent(arguments);
		this.mon(this.frameBodyEl, 'scroll', 'handleScrolling');
		if (Ext.is.iOS) {
			Ext.apply(this, {overItemCls: ''});
		}
	},


	truncateLabels: function() {
		var me = this;

		if (!me.el) {
			me.onceRendered.then(me.truncateLabels.bind(me));
			return;
		}

		wait(100).then(function() {
			var labels = me.el.select('.outline-row .label');
			labels.each(function(label) {
				me.truncateText(label.dom, null, true);
			});
		});
	},


	handleScrolling: function() {
		var selected = this.getSelectedNodes()[0],
			selectedEl = Ext.get(selected);

		if (selectedEl && this.frameBodyEl) {
			if (selectedEl.getY() < this.frameBodyEl.getY()) {
				selectedEl.addCls('out-of-view');
			} else {
				selectedEl.removeCls('out-of-view');
			}
		}
	},


	clear: function() {
		this.bindStore('ext-empty-store');
	},


	maybeChangeSelection: function(ntiid, fromEvent) {
		var me = this, store = me.store;
		//prevent asynchronous calls that finish late from messing with us.
		if (fromEvent && fromEvent !== store) {
			return;
		}

		if (store.onceBuilt) {
			store.onceBuilt().then(function() {
				me.doChangeSelection(ntiid, store);
			});
		}
	},


	doChangeSelection: function(ntiid, fromEvent) {
		//prevent asynchronous calls that finish late from messing with us.
		if (fromEvent && fromEvent !== this.store) {
			return;
		}


		var me = this,
			store = me.store,
			selectionModel = me.getSelectionModel();

		function findRecordFromLineage(lineage) {
			var record;

			while (!record && lineage.length) {
				record = store.findRecord('NTIID', lineage.shift(), false, true, true);
			}

			return record;
		}

		ContentUtils.getLineage(ntiid, me.currentBundle)
			.then(function(lineages) {
				var record;

				while (!record && lineages.length) {
					record = findRecordFromLineage(lineages.shift());
				}

				if (!record) {
					return Promise.reject('No record found');
				}

				return record;
			})
			.fail(function() {
				var index;

				record = store.findBy(function(rec) {
					return rec.get('type') === 'lesson' && rec.get('NTIID');
				});

				if (!record) {
					return Promise.reject('No record found');
				}

				return record;
			})
			.then(function(record) {
				selectionModel.select(record);
			})
			.fail(function(reason) {
				selectionModel.deselectAll();

				if (!store.getCount()) {
					me.fireEvent('empty-outline');
				}
			});
	},


	setNavigationStore: function(bundle, store) {
		if (bundle === this.currentBundle && store === this.store) {
			return;
		}

		var me = this,
			catalog = bundle.getCourseCatalogEntry(),
			shouldShowDates = catalog && !catalog.get('DisableOverviewCalendar');

		function bindStore() {
			me.bindStore(store);

			wait().then(me.refresh.bind(me));
		}

		this.currentBundle = bundle;

		if (me.store !== store) {
			me.tpl.allowDates = shouldShowDates;

			me.clear();

			if (!store.onceBuilt) {
				bindStore();
			} else {
				store.onceBuilt().then(bindStore);
			}
		}
	},


	selectRecord: function(record) {
		if (typeof record === 'number' && isFinite(record)) {
			record = this.store.getAt(record);
		}

		this.getSelectionModel().select(record, false, true);

		return record;
	},


	getActiveItem: function() {
		return this.getSelectionModel().getSelection()[0];
	}
});
