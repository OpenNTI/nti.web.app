Ext.define('NextThought.view.menus.MostRecentContent', {
	extend: 'Ext.menu.Menu',
	alias: 'widget.most-recent-content-switcher',

	border: false, frame: false,

	ui: 'content-switcher',
	showSeparator: false,
	layout: 'auto',

	plain: true,

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
						{ cls: 'image', style: {backgroundImage: 'url({icon})'} },
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

		var store,
			courses = Ext.getStore('courseware.EnrolledCourses'),
			s = PersistentStorage.getProperty(this.persistenceKey, this.persistenceProperty, []);

		function getRecord(v, i, a) {
			var promise = new Promise(),
				title;

			function f(o) {
				a[i] = o;
				if (o) {
					o.lastTracked = Ext.Date.parse(v.l, 'timestamp');
				}
				promise.fulfill(o);
			}

			if (v.c) {
				courses.getCourse(v.i).then(f);
			} else {
				title = Library.getTitle(v.i);

				if (title) { f(title); }
				else { promise.reject('Not Found'); }
			}

			return promise;
		}

		try {
			store = this.getStore();

			Promise.pool(Ext.Array.map(s, getRecord)).then(function(records) {
				store.loadRecords(Ext.Array.clean(records));
				if (store.getCount()) {
					this.fireEvent('update-current', store.getAt(0));
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
					{ name: 'icon', type: 'string' }
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


	track: function(rec, remove) {
		var s = this.getStore();
		try {
			s.remove(rec);
			rec.lastTracked = new Date();
			if (!remove) {
				s.add(rec);
			}
		}
		catch (e) {
			console.warn('Dropping content tracking... an error occured:', e.stack || e.message);
			return;
		}

		if (s.getCount() > 5) {
			try {
				s.remove(s.getRange(5));
			} catch (er) {
				console.warn('An error occured removing the last record from this store, purging just to be safe.', er.stack || er.message);
				s.removeAll();
			}
		}


		if (this.allowTracking) {
			s = s.getRange();
			Ext.each(s, function(t, i) {

				s[i] = {
					c: t.get('isCourse'),
					i: t.getId(),
					l: t.lastTracked
				};
			});
			//Cant save records to local storage...so must save just the id's or the index of the content
			PersistentStorage.updateProperty(this.persistenceKey, this.persistenceProperty, s);
		}
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
