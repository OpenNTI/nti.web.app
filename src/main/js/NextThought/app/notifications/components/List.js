Ext.define('NextThought.app.notifications.components.List', {
	extend: 'Ext.container.Container',
	alias: 'widget.notifications-panel',

	requires: [
		'NextThought.app.notifications.StateStore',
		'NextThought.app.notifications.components.Group',
		'NextThought.app.windows.Actions',
		'NextThought.app.navigation.path.Actions'
	],

	ISCHANGE: /change$/,

	cls: 'notification-list',
	layout: 'none',

	items: [],

	initComponent: function() {
		this.callParent(arguments);

		this.groups = {};

		this.NotificationsStore = NextThought.app.notifications.StateStore.getInstance();

		this.NotificationsStore.getStore()
			.then(this.loadBatch.bind(this));
	},


	getGroupContainer: function() {
		return this;
	},


	loadBatch: function(batch) {

		batch.getItems()
			.then(this.fillInItems.bind(this));
	},


	fillInItems: function(items) {
		var me = this;

		items.forEach(function(item) {
			var group = item.get('NotificationGroupingField'),
				groupName = group.getTime();

			if (!me.groups[groupName]) {
				me.addGroup(groupName, group);
			}

			group = me.groups[groupName];

			if (group) {
				group.addItem(item);
			} else {
				console.error('No group for: ', group, item);
			}
		});
	},


	addGroup: function(groupName, group) {
		this.groups[groupName] = this.add({
			xtype: 'notification-group',
			group: group
		});
	}
});

// Ext.define('NextThought.app.notifications.components.List', {
// 	extend: 'Ext.view.View',
// 	alias: 'widget.notifications-panel',

// 	requires: [
// 		'NextThought.store.PageItem',
// 		'NextThought.app.notifications.StateStore',
// 		'NextThought.app.notifications.components.types.*',
// 		'NextThought.app.windows.Actions',
// 		'NextThought.app.navigation.path.Actions'
// 	],

// 	cls: 'user-data-panel notifications',

// 	ISCHANGE: /change$/,

// 	PREVIEW_SIZE: 20,

// 	deferEmptyText: true,
// 	emptyText: Ext.DomHelper.markup([
// 		{
// 			cls: 'history nothing rhp-empty-list',
// 			html: getString('NextThought.view.account.notifications.Panel.empty-state')
// 		}
// 	]),

// 	itemSelector: '.item',

// 	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
// 		{tag: 'tpl', 'for': '.', cn: [
// 			{tag: 'tpl', 'if': 'values.divider', cn: {cls: 'divider item', cn: [{tag: 'span', html: '{label}'}]}},
// 			{tag: 'tpl', 'if': '!values.divider', cn: ['{%this.getTemplateFor(values, out)%}']}
// 		]}
// 	]), {
// 		ISCHANGE: /change$/,

// 		getTemplateFor: function(values, out) {
// 			if (this.ISCHANGE.test(values.MimeType)) {
// 				values = values.Item.getData();
// 				values.FromChange = true;
// 			}

// 			if (!this.subTemplates || !this.subTemplates[values.MimeType]) {
// 				console.log('No tpl for:', values.MimeType);
// 				//you cannot omit creating a row! throws off the view
// 				return Ext.DomHelper.createTemplate({cls: 'history hidden x-hidden'}).applyOut(values, out);
// 			}

// 			return this.subTemplates[values.MimeType].applyOut(values, out);
// 		}
// 	}),


// 	registerSubType: function(key, itemTpl) {
// 		var me = this;

// 		if (!me.tpl.subTemplates) {
// 			me.tpl.subTemplates = {};
// 		}

// 		(!Ext.isArray(key) ? [key] : key).forEach(function(key) {
// 			me.tpl.subTemplates[key] = itemTpl;
// 		});
// 	},


// 	registerFillData: function(key, fn) {
// 		var me = this;

// 		if (!me.fillData) {
// 			me.fillData = {};
// 		}

// 		(!Ext.isArray(key) ? [key] : key).forEach(function(key) {
// 			me.fillData[key] = fn;
// 		});
// 	},


// 	registerClickHandler: function(key, fn) {
// 		var me = this;

// 		if (!me.clickHandlers) {
// 			me.clickHandlers = {};
// 		}

// 		(!Ext.isArray(key) ? [key] : key).forEach(function(key) {
// 			me.clickHandlers[key] = fn;
// 		});
// 	},


// 	initComponent: function() {
// 		var Types = NextThought.app.notifications.components.types;

// 		this.callParent(arguments);

// 		this.types = [
// 			Types.Note.create({panel: this}),
// 			Types.ForumTopic.create({panel: this}),
// 			Types.BlogEntry.create({panel: this}),
// 			Types.Grade.create({panel: this}),
// 			Types.Feedback.create({panel: this}),
// 			Types.ForumComment.create({panel: this}),
// 			Types.BlogComment.create({panel: this}),
// 			Types.BlogEntryPost.create({panel: this}),
// 			Types.Contact.create({panel: this}),
// 			Types.Badge.create({panel: this})
// 		];

// 		this.highlightItem = this.types[1];

// 		this.NotificationsStore = NextThought.app.notifications.StateStore.getInstance();
// 		this.PathActions = NextThought.app.navigation.path.Actions.create();

// 		this.WindowActions = NextThought.app.windows.Actions.create();

// 		this.on({
// 			activate: this.onActivate.bind(this),
// 			deactivate: this.onDeactivate.bind(this)
// 		});

// 		this.NotificationsStore.getStore()
// 			.then(this.buildStore.bind(this))
// 			.then(this.setUpListeners.bind(this))
// 			.fail(this.failedToGetStore.bind(this));
// 	},


// 	onActivate: function() {},
// 	onDeactivate: function() {},


// 	isOnLastBatch: function() {
// 		return false;
// 	},


// 	unwrap: function(record) {
// 		if (this.ISCHANGE.test(record.get('MimeType'))) {
// 			return record.getItem();
// 		}

// 		return record;
// 	},


// 	buildStore: function(parentStore) {
// 		var me = this,
// 			registry = me.tpl.subTemplates,
// 			s = NextThought.store.PageItem.create({
// 				proxy: 'memory',
// 				storeId: me.storeId,
// 				sortOnLoad: true,
// 				statefulFilters: false,
// 				remoteSort: false,
// 				remoteFilter: false,
// 				remoteGroup: false,
// 				filterOnLoad: true,
// 				sortOnFilter: true,
// 				groupers: [
// 					{
// 						direction: 'DESC',
// 						property: 'NotificationGroupingField'
// 					}
// 				],
// 				sorters: [
// 					function(a, b) { return a.isHeader === b.isHeader ? 0 : a.isHeader ? -1 : 1; },
// 					{
// 						direction: 'DESC',
// 						property: 'CreatedTime'
// 					}
// 				],
// 				filters: [
// 					function(item) {
// 						if (/change$/i.test(item.get('MimeType')) && item.getItem()) {
// 							item = item.getItem();
// 						}

// 						var m = item.get('MimeType'),
// 							f = !m || registry.hasOwnProperty(m);

// 						if (!f) {
// 							console.warn('Unregistered Type:' + item.get('MimeType'), 'This component does not know how to render this item.');
// 						}

// 						return f;
// 					}
// 				]
// 			});

// 		me.store = s;
// 		s.backingStore = parentStore;

// 		me.bindStore(s);
// 		me.setMaskBind(parentStore);

// 		ObjectUtils.defineAttributes(s, {
// 			lastViewed: {
// 				getter: function() { return parentStore.lastViewed; },
// 				setter: function(v) { parentStore.lastViewed = v; }
// 			}
// 		});

// 		return s;
// 	},


// 	setUpListeners: function(store) {},


// 	insertDividers: function() {
// 		var s = this.store,
// 			headers = [];

// 		s.getGroups().forEach(function(g) {
// 			var d = g.name && (Ext.isDate(g.name) ? g.name : new Date(g.name)),
// 				label;

// 			if (!(s.snapshot || s.data).getByKey(d)) {
// 				label = Ext.data.Types.GROUPBYTIME.groupTitle(d);

// 				if (label) {
// 					headers.push(NextThought.model.UIViewHeader.create({
// 						NotificationGroupingField: d,
// 						label: label
// 					}, d.toString()));
// 				}
// 			}
// 		});

// 		if (headers.length) {
// 			Ext.data.Store.prototype.add.call(s, headers);
// 			s.sort();
// 			this.refresh();
// 		}
// 	},


// 	recordsAdded: function(store, records) {
// 		Ext.each(records, this.fillInData, this);
// 	},


// 	storeLoaded: function(store) {
// 		var fill = this.fillInData.bind(this);

// 		store.getRange().forEach(function(r) {
// 			try {
// 				fill(r);
// 			} catch (e) {
// 				console.warn('There was an error...\n', e.stack || e.message || e);
// 			}
// 		});
// 		this.insertDividers();
// 		this.maybeShowMoreItems();
// 	},


// 	maybeShowMoreItems: function() {},


// 	fillInData: function(rec) {
// 		var wrapped = rec;

// 		rec = this.unwrap(rec);

// 		if (!(rec instanceof NextThought.model.UIViewHeader)) {
// 			this.PathActions.getPathToObject(rec);
// 		}


// 		if (Ext.isFunction(this.fillData && this.fillData[rec.get('MimeType')])) {
// 			this.fillData[rec.get('MimeType')](rec, wrapped);
// 		}
// 	},


// 	failedToGetStore: function() {
// 		if (this.rendered) {
// 			this.on('afterrender', this.failedToGetStore.bind(this));
// 			return;
// 		}

// 		this.deferEmptyText = false;
// 		this.refresh();
// 	},


// 	afterRender: function() {
// 		this.callParent(arguments);

// 		this.on({
// 			itemClick: this.rowClicked.bind(this)
// 		});
// 	},


// 	addMask: function() {
// 		this.el.mask('Loading...');
// 	},


// 	removeMask: function() {
// 		if (this.el) {
// 			this.el.unmask();
// 		}
// 	},

// 	/**
// 	 * What to do when an item is clicked
// 	 * @override
// 	 * @param  {Object} view this
// 	 * @param  {Object} rec  the record for the node that was clicked
// 	 * @param  {Object} item the Ext.Element of the node
// 	 */
// 	rowClicked: function(view, rec, item) {}
// });
