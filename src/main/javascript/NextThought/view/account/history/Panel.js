Ext.define('NextThought.view.account.history.Panel', {
	extend: 'Ext.view.View',
	alias: ['widget.user-history-panel'],

	requires: [
		'NextThought.model.UIViewHeader',
		'NextThought.model.events.Bus',
		'NextThought.store.PageItem',
		'NextThought.util.Time',
		'NextThought.model.converters.GroupByTime',
		'NextThought.view.account.history.mixins.Note',
		'NextThought.view.account.history.mixins.ForumTopic',
		'NextThought.view.account.history.mixins.BlogEntry',
		'NextThought.view.account.history.mixins.Highlight',
		'NextThought.view.account.history.mixins.Bookmark'

	],

	mixins: {
		'activityFilter': 'NextThought.mixins.ActivityFilters'
	},

	stateful: true,

	storeId: 'noteHighlightStore',
	filter: 'MeOnly,Bookmarks',
	filterOperator: '0',
	filterMap: {
		'application/vnd.nextthought.bookmarks': 'Bookmarks'
	},

	mimeType: [
		'note',
		'highlight',
		'contact',
		'forums.personalblogcomment',
		'forums.personalblogentrypost',
		'forums.communityheadlinepost',
		'forums.contentheadlinepost',
		'forums.generalforumcomment',
		'forums.contentforumcomment'
	],

	grouping: 'GroupingField',

	ui: 'history',
	cls: 'user-data-panel scrollable',
	preserveScrollOnRefresh: true,

	deferEmptyText: true,

	emptyText: Ext.DomHelper.markup([
		{
			cls: 'history nothing rhp-empty-list',
			html: getString('NextThought.view.account.history.Panel.empty-state')
		}
	]),


	itemSelector: '.history',

	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'tpl', 'for': '.', cn: [
			{tag: 'tpl', 'if': 'values.divider', cn: { cls: 'divider history', cn: [{tag: 'span', html: '{label}'}] }},
			{tag: 'tpl', 'if': '!values.divider', cn: ['{%this.getTemplateFor(values,out)%}']}
		]}
	]), {
		getTemplateFor: function(values, out) {
			if (!this.subTemplates || !this.subTemplates[values.MimeType]) {
				console.log('No tpl for:', values.MimeType);
				return Ext.DomHelper.createTemplate({cls: 'history hidden x-hidden'}).applyOut(values, out);//you can't NOT create a row! throws off the view
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
		this.callParent(arguments);

		this.noteItem = new NextThought.view.account.history.mixins.Note({panel: this});
		this.highlightItem = new NextThought.view.account.history.mixins.Highlight({panel: this});
		this.forumTopicItem = new NextThought.view.account.history.mixins.ForumTopic({panel: this});
		this.blogEntryItem = new NextThought.view.account.history.mixins.BlogEntry({panel: this});
		this.bookmarkItem = new NextThought.view.account.history.mixins.Bookmark({panel: this});

		this.buildStore();

		this.on('resize', 'manageMaskSize');

		this.setUpMenu('history');
	},


	getMimeTypes: function() {
		this.mimeTypes = [];
		Ext.each(this.mimeType, function(t) {
			this.mimeTypes.push('application/vnd.nextthought.' + RegExp.escape(t));
		}, this);

		return this.mimeTypes;
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
		if (NextThought.store.PageItem.prototype.proxy.url === 'tbd') {
			Ext.defer(this.buildStore, 100, this);
			return;
		}

		function load() {
			s.load();
		}

		var registry = this.tpl.subTemplates,
			s = NextThought.store.PageItem.create({
			id: this.storeId,
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
					var m = item.get('MimeType'),
						f = !m || registry.hasOwnProperty(m);
					if (!f) {console.warn('Unregistered Type: ' + item.get('MimeType'), 'This component does not know how to render this item.');}
					return f;
				}
			]
		});

		function makeMime(v) {
			return 'application/vnd.nextthought.' + v.toLowerCase();
		}

		s.proxy.extraParams = Ext.apply(s.proxy.extraParams || {}, {
			sortOn: 'createdTime',
			sortOrder: 'descending',
			filter: this.filter,
			exclude: [
				 'redaction',
				 'assessment.AssessedQuestion',
				 'assessment.AssessedQuestionSet',
				 'forums.communityheadlinepost',
				 'forums.personalblogentrypost'
			 ].map(makeMime).join(',')
		});



		this.store = s;

		this.applyFilterParams();

		this.mon(this.store, {
			add: 'recordsAdded',
			load: 'storeLoaded'
		});


		this.bindStore(this.store);
		if (this.rendered) {
			load();
		} else {
			this.on('afterrender', load);
		}
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
			} else {
				console.log('already there');
			}
		});

		if (headers.length) {
			Ext.data.Store.prototype.add.call(s, headers);
			this.refresh();
		}
	},


	applyFilterParams: function() {
		if (this.store) {
			Ext.apply(this.store.proxy.extraParams, {
				filterOperator: this.filterOperator,
				filter: this.filter,
				accept: this.getMimeTypes().join(',')
			});
		}
	},


	recordsAdded: function(store, records) {
		console.debug(' UserDataPanel Store added records:', arguments);
		Ext.each(records, this.fillInData, this);
	},


	storeLoaded: function(store) {
		var me = this;

		//wait until the library is loaded so Location.getMeta will return something
		Library.onceLoaded()
			.then(function() {
				store.getRange().forEach(function(o) {
					try {
						me.fillInData(o);
					} catch (e) {
						console.warn('There was an error...\n', e.stack || e.message || e);
					}
				});
				me.insertDividers();

				me.maybeShowMoreItems();
			});
	},


	maybeShowMoreItems: function() {
		//if we can't scroll
		if (this.el && this.el.isVisible() && this.el.getHeight() >= this.el.dom.scrollHeight) {
			this.prefetchNext();
		}
	},


	fillInData: function(rec) {
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

		this.lastScroll = 0;
		this.mon(this.el, {
			scroll: 'onScroll'
		});

		this.getTypesMenu().show().hide();
		this.mixins.activityFilter.afterRender.apply(this);
	},


	getState: function() {
		return this.mixins.activityFilter.getState.apply(this, arguments);
	},


	applyState: function() {
		return this.mixins.activityFilter.applyState.apply(this, arguments);
	},


	rowClicked: function(view, rec, item) {
		if (Ext.isFunction(this.clickHandlers && this.clickHandlers[rec.get('MimeType')])) {
			this.clickHandlers[rec.get('MimeType')](view, rec);
		}
	},


	rowHover: function(view, record, item, index, e) {
		if (record.isHeader) {return;}

		var popout = NextThought.view.account.activity.Popout,
			target = Ext.get(item),
			me = this,
			cls = record.get('Class');

		if (!record || me.activeTargetDom === item || cls === 'Highlight' || cls === 'Bookmark') {
			return;
		}

		me.cancelPopupTimeout();

		me.hoverTimeout = Ext.defer(this.showPopup, 1200, me, [record, item]);//make sure the user wanted it...wait for the pause.

		target.on('mouseout', me.cancelPopupTimeout, me, {single: true});
	},


	showPopup: function(record, item) {
		var popout,
			target = Ext.get(item),
			me = this;

		if (record && record.getClassForModel) {
			popout = record.getClassForModel('widget.activity-popout-', NextThought.view.account.activity.Popout);
		}

		function fin(pop) {
			// If the popout is destroyed, clear the activeTargetDom,
			// that way we will be able to show the popout again.
			if (!pop) {
				return;
			}
			pop.on('destroy', function() {
				delete me.activeTargetDom;
				delete me.activeTargetRecord;
			}, pop);
		}

		me.cancelPopupTimeout();

		target.un('mouseout', me.cancelPopupTimeout, me, {single: true});
		me.activeTargetDom = item;
		me.activeTargetRecord = record;

		popout.popup(record, target, me, undefined, fin);
	},


	cancelPopupTimeout: function() {
		delete this.activeTargetDom;
		delete this.activeTargetRecord;
		clearTimeout(this.hoverTimeout);
	},


	onUpdate: function(store, record) {
		var item, r = this.callParent(arguments);
		if (this.activeTargetRecord === record) {
			item = this.getNode(record);
			this.showPopup(record, item);
		}
		return r;
	},


	prefetchNext: Ext.Function.createBuffered(function() {
		var s = this.getStore(), max;

		if (!s.hasOwnProperty('data')) {
			return;
		}

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
		}

	},


	applyFilters: function(mimeTypes, filterTypes) {
		if (Ext.isEmpty(mimeTypes) && Ext.isEmpty(filterTypes)) {
			return;
		}

		var me = this,
			s = me.getStore(),
			fo = (filterTypes.length > 1) ? '0' : '1';

		if (Ext.isEmpty(filterTypes)) {
			filterTypes = ['MeOnly', 'Bookmarks'];
			fo = '0';
		}

		me.filter = filterTypes.join(',');
		me.filterOperator = (filterTypes.length > 1) ? fo : undefined;

		this.getMimeTypes = function() { return mimeTypes; };

		if (!s || s.storeId === 'ext-empty-store') {
			return;
		}


		s.removeAll();

		me.applyFilterParams();

		s.currentPage = 1;
		s.load();
	}
});
