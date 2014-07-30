Ext.define('NextThought.view.menus.MostRecentContent', {
	extend: 'Ext.menu.Menu',
	alias: 'widget.most-recent-content-switcher',

	ui: 'content-switcher',
	layout: 'auto',

	autoRender: true,
	renderTo: Ext.getBody(),

	persistenceKey: 'recents',
	persistenceProperty: 'navigation/content/switcher',

	config: {
		ownerNode: null
	},


	initComponent: function() {
		this.callParent(arguments);
		this.view = this.add({
			xtype: 'dataview',
			store: this.getStore(),
			plain: true,
			ui: 'content-switcher',

			trackOver: true,
			overItemCls: 'over',
			selectedItemCls: 'selected',
			itemSelector: '.item',
			tpl: Ext.DomHelper.markup([
				{ tag: 'tpl', 'for': '.', cn: {
					cls: 'item',
					cn: [
						{ tag: 'tpl', 'if': '!thumb', cn: { cls: 'image', style: {backgroundImage: 'url({icon})'} }},
						{ tag: 'tpl', 'if': 'thumb', cn: { cls: 'image', style: {backgroundImage: 'url({thumb})'} }},
						{
							cls: 'wrap',
							cn: [
								{ tag: 'tpl', 'if': 'isCourse', cn: { cls: 'courseName', html: '{label}'}},
								{ tag: 'tpl', 'if': '!isCourse', cn: { cls: 'provider', html: '{label}'}},
								{ cls: 'title', html: '{title}'}
							]
						}
					]
				}},
				{ cls: 'more', cn: [{},{},{}]}
			]),
			xhooks: {
				prepareData: function(data, index, record) {
					var i = this.callParent(arguments);
					Ext.apply(i, record.asUIData());
					return i;
				}
			},
			listeners: {
				scope: this,
				select: 'onSelected',
				containerclick: 'onFramedClicked'
			}
		});


		this.on({
			scope: this,
			afterRender: 'setInitialPosition',
			mouseleave: 'startHide',
			mouseover: 'stopHide'
		});

		Library.on('loaded', 'fillStore', this, {buffer: 1});
	},


	setInitialPosition: function() {
		this.el.setLocalY(0);
		this.el.setLocalX(0);
	},


	fillStore: function() {
		this.allowTracking = true;

		var store, me = this,
			s = PersistentStorage.getProperty(this.persistenceKey, this.persistenceProperty, []);

		function getRecord(v, i, a) {
			var title;

			return new Promise(function(fulfill, reject) {
				function f(o) {
					a[i] = o;
					if (o) {
						o.lastTracked = Ext.Date.parse(v.l, 'timestamp');
					}
					fulfill(o);
				}

				if (ParseUtils.isNTIID(v.i)) {
					if (v.c) {
						CourseWareUtils.resolveCourse(v.i).then(f, reject);
					} else {
						ContentManagementUtils.findBundle(v.i).then(f, reject);
					}
				} else {
					title = Library.getTitle(v.i);
					if (title) { f(title); }
					else { reject(); }
				}

			});
		}

		try {
			store = this.getStore();

			Promise.all(s.map(getRecord)).then(function(records) {
				var range = store.getRange() || [];

				store.loadRecords(Ext.Array.clean(records));

				//if we tried to track a record before we got here, track it again so it will be at the top
				if (range[0]) {
					me.track(range[0]);
				}

				if (store.getCount()) {
					me.fireEvent('update-current', store.getAt(0));
				}
			});
		}
		catch (e) {
			console.warn(e.stack || e.message || e);
		}
	},


	startHide: function() {
		this.stopHide();
		this.menuHideTimer = Ext.defer(this.hide, 750, this);
	},

	stopHide: function() {
		clearTimeout(this.menuHideTimer);
	},


	getStore: function() {
		if (!this.store) {
			this.store = new Ext.data.Store({
				fields: [
					{ name: 'id', type: 'string' },
					{ name: 'isCourse', type: 'bool' },
					{ name: 'title', type: 'string' },
					{ name: 'label', type: 'string' },
					{ name: 'icon', type: 'string' },
					{ name: 'thumb', type: 'string' }
				],
				proxy: 'memory',
				sorters: [
					function(a, b) {
						a = a.lastTracked.getTime();
						b = b.lastTracked.getTime();
						return b - a;
					}
				]
			});
		}

		return this.store;
	},


	show: function() {
		if (this.getStore().getCount() === 0) {return;}

		var n = this.getOwnerNode();
		this.setWidth(n.getWidth());

		try {
			this.callParent(arguments);
		}
		finally {
			this.fireEvent('mouseover');//trigger the partent from hiding this if the mouse doesn't move.
			this.alignTo(n, 'tl-tl');
		}
	},


	drop: function(catalogEntry) {
		var store = this.getStore(),
			rec = store.findBy(function(rec) {
				return rec.represents(catalogEntry);
			});

		if (rec >= 0) {
			store.removeAt(rec);
			this.saveStore();
		}
	},


	track: function(rec, remove) {
		var s = this.getStore();
		try {
			if (rec) {
				s.remove(rec);
				rec.lastTracked = new Date();
				if (!remove) {
					s.add(rec);
				}
			}
		}
		catch (e) {
			console.warn(e.stack || e.message || e);
		}

		if (s.getCount() > 5) {
			try {
				s.remove(s.getRange(5));
			} catch (er) {
				s.removeAll();
			}
		}


		if (this.allowTracking) {
			this.saveStore();
		}
	},


	saveStore: function() {
		var s = this.getStore().getRange();
		s.forEach(function(t, i) {

			s[i] = {
				c: t.isCourse,
				b: t.isBundle,
				i: t.getId(),
				l: t.lastTracked
			};
		});
		//Cant save records to local storage...so must save just the id's or the index of the content
		PersistentStorage.updateProperty(this.persistenceKey, this.persistenceProperty, s);
	},


	onSelected: function(selModel, record) {
		selModel.deselect(record);
		record.fireNavigationEvent(this);
		this.hide();
	},


	onFramedClicked: function() {
		this.fireEvent('go-to-library');
		this.hide();
	}

});
