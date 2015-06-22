Ext.define('NextThought.app.notifications.components.List', {
	extend: 'Ext.view.View',
	alias: 'widget.notifications-panel',

	requires: [
		'NextThought.store.PageItem',
		'NextThought.app.notifications.StateStore',
		'NextThought.app.notifications.components.types.*'
	],

	cls: 'user-data-panel notifications',

	ISCHANGE: /change$/,

	PREVIEW_SIZE: 20,

	deferEmptyText: true,
	emptyText: Ext.DomHelper.markup([
		{
			cls: 'history nothing rhp-empty-list',
			html: getString('NextThought.view.account.notifications.Panel.empty-state')
		}
	]),

	itemSelector: '.item',

	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'tpl', 'for': '.', cn: [
			{tag: 'tpl', 'if': 'values.divider', cn: {cls: 'divider item', cn: [{tag: 'span', html: '{label}'}]}},
			{tag: 'tpl', 'if': '!values.divider', cn: ['{%this.getTemplateFor(values, out)%}']}
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


	registerSubType: function(key, itemTpl) {
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
		var Types = NextThought.app.notifications.components.types;

		this.callParent(arguments);

		this.types = [
			Types.Note.create({panel: this}),
			Types.ForumTopic.create({panel: this}),
			Types.BlogEntry.create({panel: this}),
			Types.Grade.create({panel: this}),
			Types.Feedback.create({panel: this}),
			Types.ForumComment.create({panel: this}),
			Types.BlogComment.create({panel: this}),
			Types.BlogEntryPost.create({panel: this}),
			Types.Contact.create({panel: this}),
			Types.Badge.create({panel: this})
		];

		this.highlightItem = this.types[1];

		this.NotificationsStore = NextThought.app.notifications.StateStore.getInstance();

		Promise.all([
			this.NotificationsStore.getURL(),
			this.NotificationsStore.getLastViewed()
		]).then(this.buildStore.bind(this));
	},


	maybeNotify: function() {
		var count = 0,
			store = this.store,
			cap = store.pageSize - 1,
			lastViewed = store.lastViewed || new Date(0),
			links = store.batchLinks || {};

		this._lastViewedURL = links.lastViewed;

		this.store.each(function(c) {
			if (c.get('CreatedTime') > lastViewed) {
				count += 1;
			}
		});

		if (count > cap) {
			count = cap + '+';
		}

		this.setBadgeValue(count);
	},


	setBadgeValue: function(count) {
		var v = count || '';

		this.badgeValue = v;

		this.updateBadge(this.badgeValue);
	},


	beginClearBadge: function(delay) {
		this.store.lastViewed = new Date();

		wait(delay || 3000)
			.then(this.clearBadge.bind(this));
	},


	clearBadge: function() {
		if (!this.badgeValue) {
			return;
		}

		this.maybeNotify();

		if (this._lastViewedURL && this.store && this.store.lastViewed) {
			//the server is expecting seconds
			Service.put(this._lastViewedURL, this.store.lastViewed.getTime() / 1000);
		}
	},


	unwrap: function(record) {
		if (this.ISCHANGE.test(record.get('MimeType'))) {
			return record.getItem();
		}

		return record;
	},


	buildStore: function(results) {
		var me = this,
			registry = me.tpl.subTemplates,
			url = results[0],
			lastViewed = results[1];

		this.loading = true;

		StoreUtils.loadItems(url, {
			batchSize: me.PREVIEW_SIZE
		}).then(function(items) {
			var s = new Ext.data.Store({
				model: 'NextThought.model.GenericObject',
				pageSize: me.PREVIEW_SIZE,
				groupers: [
					{
						direction: 'DESC',
						property: 'NotificationGroupingField'
					}
				],
				sorter: [
					//put the headers at the top of their groups
					function(a, b) { return a.isHeader === b.isHeader ? 0 : a.isHeader ? -1 : 1; },
					{
						direct: 'DESC',
						property: 'CreatedTime'
					}
				],
				filters: [
					function(item) {
						if (/change$/i.test(item.get('MimeType')) && item.getItem()) {
							item = item.getItem();
						}

						var m = item.get('MimeType'),
							f = !m || registry.hasOwnProperty(m);

						if (!f) {
							console.warn('Unregistered Type: ' + m, 'This component does not know hot to render this item');
						}

						return f;
					}
				]
			});

			me.mon(s, {
				add: function() {
					me.recordsAdded.apply(me, arguments);
					me.maybeNotify();
				},
				refresh: function() {
					me.storeLoaded.apply(me, arguments);
					me.maybeNotify();
				}
			});

			s.lastViewed = lastViewed;
			me.store = s;
			me.bindStore(s);

			s.loadRecords(items, {addRecords: true});

			this.loading = false;

			if (me.rendered) {
				me.removeMask();
			}
		});
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
						NotificationGroupingField: d,
						label: label
					}, d.toString()));
				}
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
		var fill = this.fillInData.bind(this);

		store.getRange().forEach(function(r) {
			try {
				fill(r);
			} catch (e) {
				console.warn('There was an error...\n', e.stack || e.message || e);
			}
		});
		this.insertDividers();
	},


	fillInData: function(rec) {
		var wrapped = rec;

		rec = this.unwrap(rec);

		if (Ext.isFunction(this.fillData && this.fillData[rec.get('MimeType')])) {
			this.fillData[rec.get('MimeType')](rec, wrapped);
		}
	},


	afterRender: function() {
		this.callParent(arguments);

		this.on({
			itemClick: this.rowClicked.bind(this)
		});

		this.lastScroll = 0;


		if (!this.store || !this.store.getCount()) {
			this.deferEmptyText = false;
			this.refresh();
		}
	},


	addMask: function() {
		this.el.mask('Loading...');
	},


	removeMask: function() {
		if (this.el) {
			this.el.unmask();
		}
	},


	rowClicked: function(view, rec, item) {
		rec = this.unwrap(rec);

		if (Ext.isFunction(this.clickHandlers && this.clickHandlers[rec.get('MimeType')])) {
			this.clickHandlers[rec.get('MimeType')](view, rec);
			this.beginClearBadge(1000);
		}
	}
});
