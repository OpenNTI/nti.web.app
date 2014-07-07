Ext.define('NextThought.view.courseware.outline.View', {
	extend: 'Ext.view.View',
	alias: 'widget.course-outline',

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
		{ cls: 'outline-row {type} {NTIID:boolStr("","disabled")}', 'data-qtip': '{label:htmlEncode}', cn: [
			{cls: 'label', html: '{label}'},
			{tag: 'tpl', 'if': 'startDate', cn: {cls: 'date', cn: [
				{html: '{startDate:date("M")}'},
				{html: '{startDate:date("j")}'}
			]}}
		]}
	]})),


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
				Ext.defer(s.select, 1, s, [next]);
			}
			return pass;

		},
		select: function(s, r) {
			if (this.fromClick || this.fromKey) {
				this.fireEvent('set-location', r.getId());
			}
			delete this.fromClick;
			delete this.fromKey;
		}
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
		Ext.destroy(this._waitForBuild);
		delete this._waitForBuild;

		if (this.store.building) {
			this._waitForBuild = this.mon(this.store, {
				destroyable: true,
				single: true,
				built: this.maybeChangeSelection.bind(this, ntiid)
			});
			return;
		}

		//prevent asynchronous calls that finish late from messing with us.
		if (fromEvent && fromEvent !== this.store) {
			return;
		}

		var r, sel, C = ContentUtils,
			store = this.store,
			lineage = C.getLineage(ntiid),
			root = lineage.last();


		//start from the page we're on, and go up to find its associated course node...
		// TODO: look at the course and find the leaf
		while (!r && lineage.length) {
			console.log('lineage', lineage);
			r = store.findRecord('NTIID', lineage.shift(), false, true, true);
		}

		//if we didn't find one, select the first item IF the page we're on matches the store's content.
		if (!r) {
			sel = this.getSelectionModel().getSelection()[0];
			if (sel) {
				if (C.getLineage(sel.getId()).last() === root) {
					return;
				}

				console.warn('Danger! Selection returned a value from different content (should not be possible)');
			}
			console.debug('No record selected, defaulting to first lesson in: ', root);
			//r = store.findRecord('type', 'lesson', 0, false, false, true);
			//find the first record that is a lesson and has an ntiid (meaning is active)
			r = store.findBy(function(rec) {
				return rec.get('type') === 'lesson' && rec.get('NTIID');
			});
		}

		if (r) {
			this.getSelectionModel().select(r);
		} else {
			this.getSelectionModel().deselectAll();

			if (!store.getCount()) {
				this.fireEvent('empty-outline');
			}
		}
	},


	maybeChangeStoreOrSelection: function(ntiid, store) {

		if (this.store !== store) {
			this.clear();
			if (store) {
				this.bindStore(store);
			}
		}

		this.maybeChangeSelection(ntiid);
	}
});
