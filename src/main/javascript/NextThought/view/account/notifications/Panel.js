Ext.define('NextThought.view.account.notifications.Panel', {
	extend: 'Ext.view.View',
	alias: ['widget.notifications-panel'],

	requires: [
		'NextThought.model.UIViewHeader',
		'NextThought.model.events.Bus',
		'NextThought.store.PageItem',
		'NextThought.util.Time',
		'NextThought.view.account.contacts.management.Popout',
		'NextThought.view.account.notifications.types.*',
		'NextThought.view.account.activity.feedback.*'
	],


	//Focus tab from user click, and clicking on an item or loading more will clear the badge.


	ISCHANGE: /change$/,

	iconCls: 'inbox',
	title: 'Notifications',
	tabConfig: {
		tooltip: 'Notifications'
	},

	ui: 'notifications',
	cls: 'user-data-panel scrollable',
	preserveScrollOnRefresh: true,
	deferEmptyText: true,
	emptyText: Ext.DomHelper.markup([
		{
			cls: 'history nothing rhp-empty-list',
			html: 'All caught up'
		}
	]),


	popupDelay: 1200,


	itemSelector: '.item',


	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'tpl', 'for': '.', cn: [
			{tag: 'tpl', 'if': 'values.divider', cn: { cls: 'divider item', cn: [{tag: 'span', html: '{label}'}] }},
			{tag: 'tpl', 'if': '!values.divider', cn: ['{%this.getTemplateFor(values,out)%}']}
		]}
	]), {
		ISCHANGE: /change$/,

		getTemplateFor: function(values, out) {
			if (this.ISCHANGE.test(values.MimeType)) {
				values = values.Item.getData();
				values.FromChange = true;
			}

			if (!this.subTemplates || !this.subTemplates[values.MimeType]) {
				console.log('No tpl for:', values.MimeType);
				//you cannot omit creating a row! throws off the view
				return Ext.DomHelper.createTemplate({cls: 'history hidden x-hidden'}).applyOut(values, out);
			}
			return this.subTemplates[values.MimeType].applyOut(values, out);
		}
	}),


	registerSubType: function reg(key, itemTpl) {
		var me = this;

		if (!me.tpl.subTemplates) {
			me.tpl.subTemplates = {};
		}


		(!Ext.isArray(key) ? [key] : key).forEach(function(key) {
			me.tpl.subTemplates[key] = itemTpl;
		});
	},


	registerFillData: function(key, fn) {
		var me = this;
		if (!me.fillData) {
			me.fillData = {};
		}

		(!Ext.isArray(key) ? [key] : key).forEach(function(key) {
			me.fillData[key] = fn;
		});
	},


	registerClickHandler: function(key, fn) {
		var me = this;

		if (!me.clickHandlers) {
			me.clickHandlers = {};
		}

		(!Ext.isArray(key) ? [key] : key).forEach(function(key) {
			me.clickHandlers[key] = fn;
		});
	},


	initComponent: function() {
		var Types = NextThought.view.account.notifications.types;
		this.callParent(arguments);
		this.types = [
			Types.Note.create({panel: this}),
			Types.ForumTopic.create({panel: this}),
			Types.BlogEntry({panel: this}),
			Types.Grade.create({panel: this}),
			Types.Feedback.create({panel: this}),
			Types.ForumComment.create({panel: this}),
			Types.BlogComment.create({panel: this}),
			Types.BlogEntryPost.create({panel: this}),
			Types.Contact.create({panel: this})
		];

		this.highlightItem = this.types[1];

		this.on({
			'resize': 'manageMaskSize'
		});

		this.buildStore();
	},


	addBadge: function() {
		var tab = this.tab;
		if (!tab) {
			console.error('no tab to badge');
		}

		if (!tab.rendered) {
			if (!tab.isListening('afterrender', this.addBadge, this)) {
				tab.on('afterrender', this.addBadge, this);
			}
			return;
		}

		this.mon(tab, 'click', 'maybeClearBadge');
		this.badge = Ext.DomHelper.append(tab.getEl(), {cls: 'badge red', html: this.badgeValue},true);
		delete tab.badge;
	},


	maybeClearBadge: function() {
		var me = this,
			manager = me.ownerLayout;
		if (!manager || manager.getActiveItem() === me) {
			return;
		}

		wait(1)//let the tab cancel activation...which will happen in the current event pump, after which,
		// we test if we were activated and if so, start the clear counter timer
				.then(function() {
					if (manager.getActiveItem() === me) {
						me.beginClearBadge();
					}
				});
	},


	maybeNotify: function() {
		var count = 0,
			store = this.store.backingStore,
			cap = store.pageSize - 1,
			lastViewed = store.lastViewed || new Date(0),
			links = store.batchLinks || {};

		this._lastViewedURL = links.lastViewed;

		this.store.each(function(c) {
			if (c.get('Last Modified') > lastViewed) {
				count++;
			}
		});

		if (count > cap) {
			count = cap + '+';
		}
		this.setBadgeValue(count);
	},


	beginClearBadge: function(delay) {
		this.store.lastViewed = new Date();
		wait(delay || 3000).then(this.clearBadge.bind(this));
	},


	clearBadge: function() {
		if (!this.badgeValue) {
			return;
		}


		this.maybeNotify();

		if (this._lastViewedURL && this.store && this.store.lastViewed) {
			Service.put(this._lastViewedURL, this.store.lastViewed.getTime() / 1000);
		}

	},


	setBadgeValue: function(count) {
		var v = count || '';

		this.badgeValue = v;

		if (!this.badge) {
			return;
		}

		this.badge.update(v);
	},


	unwrap: function(record) {
		if (this.ISCHANGE.test(record.get('MimeType'))) {
			return record.get('Item');
		}

		return record;
	},


	onMaskBeforeShow: function(mask) {
		if (this.getHeight() === 0) {
			mask.setHeight(0);
		}
		return this.callParent(arguments);
	},


	manageMaskSize: function(width, height) {
		if (this.loadMask && this.loadMask.setHeight) {
			this.loadMask.setHeight(height);
		}
	},


	buildStore: function() {
		//function makeMime(v) { return 'application/vnd.nextthought.' + v.toLowerCase(); }

		if (!Ext.getStore('notifications').url) {
			Ext.defer(this.buildStore, 100, this);
			return;
		}

		var me = this,
			registry = me.tpl.subTemplates,
			parentStore = Ext.getStore('notifications'),
			s = NextThought.store.PageItem.create({
				proxy: 'memory',
				storeId: me.storeId,
				sortOnLoad: true,
				statefulFilters: false,
				remoteSort: false,
				remoteFilter: false,
				remoteGroup: false,
				filterOnLoad: true,
				sortOnFilter: true,
				groupers: [
					{
						direction: 'DESC',
						property: 'GroupingField'
					}
				],
				sorters: [
					function(a, b) { return a.isHeader === b.isHeader ? 0 : a.isHeader ? -1 : 1; },
					{
						direction: 'DESC',
						property: 'CreatedTime'
					}
				],
				filters: [
					function(item) {
						if (/change$/i.test(item.get('MimeType')) && item.get('Item')) {
							item = item.get('Item');
						}
						var m = item.get('MimeType'),
							f = !m || registry.hasOwnProperty(m);
						if (!f) {console.warn('Unregistered Type: ' + item.get('MimeType'), 'This component does not know how to render this item.');}
						return f;
					}
				]
			});


		me.store = s;
		s.backingStore = parentStore;
		ObjectUtils.defineAttributes(s, {
			lastViewed: {
				getter: function() {return parentStore.lastViewed;},
				setter: function(v) {parentStore.lastViewed = v;}
			}
		});

		me.mon(parentStore, {
			add: function(store, recs) { s.add(recs); s.sort(); },
			load: function(store, recs) {
				s.loadRecords(recs, {addRecords: true});
				s.sort();
				me.maybeLoadMoreIfNothingNew();
			}
		});

		me.mon(s, {
			add: 'recordsAdded',
			refresh: 'storeLoaded'
		});

		me.mon(s, {
			add: 'maybeNotify',
			refresh: 'maybeNotify'
		});

		me.bindStore(s);
	},


	insertDividers: function() {
		var s = this.store,
			headers = [];

		s.getGroups().forEach(function(g) {
			var d = g.name && (Ext.isDate(g.name) ? g.name : new Date(g.name)),
				label;
			if (!(s.snapshot || s.data).getByKey(d)) {
				label = Ext.data.Types.GROUPBYTIME.groupTitle(d);
				if (label) {
					headers.push(NextThought.model.UIViewHeader.create({
						GroupingField: d,
						label: label
					}, d.toString()));
				}
			//} else {
				//console.log('already there');
			}
		});

		if (headers.length) {
			Ext.data.Store.prototype.add.call(s, headers);
			this.refresh();
		}
	},


	recordsAdded: function(store, records) {
		Ext.each(records, this.fillInData, this);
	},


	storeLoaded: function(store) {
		Ext.each(store.getRange(), this.fillInData, this);
		this.insertDividers();
		this.maybeShowMoreItems();
	},


	maybeShowMoreItems: function() {
		//if we can't scroll
		if (this.el && this.el.isVisible() && this.el.getHeight() >= this.el.dom.scrollHeight) {
			this.prefetchNext();
		}
	},


	maybeLoadMoreIfNothingNew: function() {
		if (this.currentCount !== undefined && this.store.getCount() <= this.currentCount) {
			console.log('Need to fetch again. Didn\'t return any new data');
			delete this.currentCount;
			this.prefetchNext();
		}
	},


	fillInData: function(rec) {
		rec = this.unwrap(rec);

		if (Ext.isFunction(this.fillData && this.fillData[rec.get('MimeType')])) {
			this.fillData[rec.get('MimeType')](rec);
		}
	},


	afterRender: function() {
		this.callParent(arguments);

		this.on({
			scope: this,
			'itemclick': 'rowClicked',
			'itemmouseenter': 'rowHover',
			'activate': 'maybeShowMoreItems'
		});

		this.on({
			el: {
				mouseleave: 'cancelPopupTimeout',
				scope: this
			}
		});

		this.lastScroll = 0;
		this.mon(this.el, {
			scroll: 'onScroll'
		});
	},


	getState: function() {
		return this.mixins.activityFilter.getState.apply(this, arguments);
	},


	applyState: function() {
		return this.mixins.activityFilter.applyState.apply(this, arguments);
	},


	rowClicked: function(view, rec, item) {
		rec = this.unwrap(rec);

		if (Ext.isFunction(this.clickHandlers && this.clickHandlers[rec.get('MimeType')])) {
			this.clickHandlers[rec.get('MimeType')](view, rec);
			this.beginClearBadge(1000);
		}
	},


	rowHover: function(view, record, item, index, e) {

		var me = this,
			cls = record.get('Class');

		if (record.isHeader) {
			me.cancelPopupTimeout();
			return;
		}

		if (!record ||
			me.activeTargetRecordId === record.getId() ||
			cls === 'Highlight' || cls === 'Bookmark') {
			return;
		}

		console.debug('Row Info:', record.data);

		me.lastHoverEvent = new Date();

		me.activeTargetRecordId = record.getId();

		me.cancelPopupTimeout();

		me.hoverTimeout = Ext.defer(this.showPopup, me.popupDelay, me, [record, item]);//make sure the user wanted it...wait for the pause.
	},


	showPopup: function(record, item) {
		var popout,
			target = Ext.get(item),
			me = this;

		record = this.unwrap(record);

		if (record && record.getClassForModel) {
			popout = record.getClassForModel('widget.activity-popout-', NextThought.view.account.activity.Popout);
		}

		function fin(pop) {
			// If the popout is destroyed, clear the activeTargetDom,
			// that way we will be able to show the popout again.
			if (!pop) {
				return;
			}
			pop.on('destroy', 'cancelPopupTimeout', me);
		}

		me.cancelPopupTimeout();
		me.popupDelay = 250;
		clearTimeout(me.resetDelayTimer);

		me.activeTargetDom = item;
		me.activeTargetRecord = record;

		popout.popup(record, target, me, undefined, fin);
		me.beginClearBadge();
	},


	cancelPopupTimeout: function() {
		var me = this;
		delete me.activeTargetDom;
		delete me.activeTargetRecord;
		clearTimeout(me.hoverTimeout);
		clearTimeout(me.resetDelayTimer);
		me.resetDelayTimer = setTimeout(function() {
			me.popupDelay = 1200;
		},
				//wait 5 seconds to restore the initial delay
				5000);
	},


	onUpdate: function(store, record) {
		try {
			var item, r = this.callParent(arguments);
			if (this.activeTargetRecord === record) {
				item = this.getNode(record);
				this.showPopup(record, item);
			}
			return r;
		} catch (e) {
			console.error(e);
		}
	},


	prefetchNext: Ext.Function.createBuffered(function() {
		var s = this.getStore(), max;

		s = s && s.backingStore;

		if (!s.hasOwnProperty('data')) {
			return;
		}

		this.currentCount = s.getCount();
		max = s.getPageFromRecordIndex(s.getTotalCount());
		if (s.currentPage < max && !s.isLoading()) {
			s.clearOnPageLoad = false;
			s.nextPage();
		}
	}, 500, null, null),


	onScroll: function(e, dom) {
		var top = dom.scrollTop,
			scrollTopMax = dom.scrollHeight - dom.clientHeight,
		// trigger when the top goes over the a limit value.
		// That limit value is defined by the max scrollTop can be, minus a buffer zone. (defined here as 10% of the viewable area)
			triggerZone = scrollTopMax - Math.floor(dom.clientHeight * 0.1),
			wantedDirection = this.lastScroll < dom.scrollTop; // false(up), true(down)
		this.lastScroll = dom.scrollTop;

		//popouts are annoying when scrolling
		this.cancelPopupTimeout();

		if (wantedDirection && top > triggerZone) {
			this.prefetchNext();
			this.beginClearBadge();
		}

	}
});
