Ext.define('NextThought.view.library.Panel', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.library-view-panel',

	requires: [
		'NextThought.view.library.CoursePage',
		'NextThought.view.library.BookPage',
		'NextThought.view.library.Navigation',
		'NextThought.view.library.available.*'
	],

	stateObj: {activeView: ''},
	stateful: true,
	stateId: 'library',

	cls: 'library-panel',

	navigation: {xtype: 'library-navigation', region: 'north', override: 'true'},

	body: {cls: 'library-body', layout: 'auto-card'},

	constructor: function() {
		this.callParent(arguments);

		this.cssRule = CSSUtils.getRule('main-view-container-styles', '#' + this.id);

		this.courseSettingsRule = CSSUtils.getRule('main-view-container-styles', '.grid-item:nth-child(4n+1) .course-settings-window');

		CSSUtils.set(this.cssRule, {width: 'auto'}, true);
	},


	updateSidePadding: function(sides) {
		function toPx(i) { return (i && i + 'px') || i; }

		this.leftSide = sides.left;

		CSSUtils.set(this.courseSettingsRule, {
			left: sides.left > 53 ? '' : toPx(-sides.left)
		});

		CSSUtils.set(this.cssRule, {
			paddingLeft: toPx(sides.left),
			paddingRight: toPx(sides.right)
		});
	},


	restore: function(state) {
		var me = this;

		if (!state.activeWindow && state.paymentcomplete !== 'true') {
			return Promise.resolve();
		}

		return me.onceRendered
			.then(function() {
				var isBook = state.activeWindow === 'books';

				if (me.activeWindow) {
					me.activeWindow.close();
				}

				if (state.paymentcomplete === 'true') {
					me.showAvailable();
					return me.activeWindow.restore(state);
				}

				me.showAvailable(isBook, state.activeId);
				return me.activeWindow.restore(state);
			});
	},


	initComponent: function() {
		this.callParent(arguments);

		this.mon(this.navigation, {
			scope: this,
			'show-library-view': 'changeView',
			'show-my-courses': 'showMyCourses',
			'show-my-admins': 'showMyAdminCourses',
			'show-my-books': 'showMyBooks',
			'show-available': 'showAvailable'
		});

		this.on('show-available', 'showAvailable');
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		me.mon(me.el, 'scroll', function(e, el) {
			if (me.navigation.maybeFixHeader(el)) {
				me.addCls('fixed');
			} else {
				me.removeCls('fixed');
			}
		});

		me.maybeRestoreState();

		if (me.activeWindow) {
			me.activeWindow.close();
		}

		if (me.restoreState) {
			me.restore(me.restoreState);
		}

		me.on('beforedeactivate', function() {
			if (me.activeWindow) {
				me.activeWindow.close();
			}
		});
	},


	addMask: function() {
		if (this.rendered) {
			this.body.el.mask('Loading...');
		}
	},


	removeMask: function() {
		if (this.rendered) {
			this.body.el.unmask();
		}
	},


	getState: function() {
		return this.stateObj;
	},


	applyState: function(state) {
		this.stateObj = state;

		this.maybeFinishLoad();
	},


	changeView: function(view) {
		var cmp = this.down('[id="' + view + '"]');

		this.body.getLayout().setActiveItem(cmp);

		//if it was successful
		if (this.body.getLayout().getActiveItem() === cmp) {
			this.navigation.updateSelection(view);
			this.stateObj[this.stateObj.activeView] = view;
			this.saveState();
		}
	},


	showMyCourses: function() {
		if (this.noCourses) { return; }

		this.navigation.setItems([
			{label: 'Current and Upcoming', viewId: 'current-courses-page'},
			{label: 'Archived', viewId: 'archived-courses-page'}
		]);

		this.body.removeAll(true);
		this.body.add([
			{
				xtype: 'library-view-course-page',
				id: 'current-courses-page',
				groupLabel: 'current',
				courses: this.currentCourses || [],
				emptyText: 'You don\'t have any courses yet...<br><a data-event = "show-available">+ Add Courses</a>'
			},
			{
				xtype: 'library-view-course-page',
				id: 'archived-courses-page',
				groupLabel: 'archived',
				courses: this.archivedCourses || [],
				emptyText: 'You do not have any archived courses.'
			}
		]);

		this.stateObj.activeView = 'mycourses';
		this.changeView(this.stateObj.mycourses || 'current-courses-page');
		this.saveState();
	},


	showMyAdminCourses: function() {
		this.navigation.setItems([
			{label: 'Current and Upcoming', viewId: 'current-admins-page'},
			{label: 'Archived', viewId: 'archived-admins-page'}
		]);

		this.body.removeAll(true);
		this.body.add([
			{
				xtype: 'library-view-course-page',
				id: 'current-admins-page',
				groupLabel: 'current',
				courses: this.currentAdministered || [],
				emptyText: 'You are not administering any courses.'
			},
			{
				xtype: 'library-view-course-page',
				id: 'archived-admins-page',
				groupLabel: 'archived',
				courses: this.archivedAdministered || [],
				emptyText: 'You have no administered courses.'
			}
		]);

		this.stateObj.activeView = 'admincourses';
		this.changeView(this.stateObj.admincourses || 'current-admins-page');
		this.saveState();
	},


	showMyBooks: function() {
		this.navigation.setItems([]);

		this.body.removeAll(true);
		this.body.add({
			xtype: 'library-view-book-page',
			id: 'books',
			books: this.bookStore,
			emptyText: 'You do not have any books.'
		});

		this.stateObj.activeView = 'books';
		this.saveState();
	},


	showAvailable: function(showBooks, activeId) {
		var me = this, state,
			win, cfg, xtype;

		if (showBooks) {
			xtype = 'library-available-books-window';

			cfg = {
				store: this.purchasables
			};

			state = 'books';
		} else {
			xtype = 'library-available-courses-window';

			cfg = {
				current: this.currentAvailable,
				upcoming: this.upcomingAvailable,
				archived: this.archivedAvailable,
				showAvailable: true,
				activeId: activeId
			};

			state = 'courses';
		}

		win = Ext.widget(xtype, cfg);

		win.showBy(this, 'tl-tl', [this.leftSide, 40]);

		this.hasAvailableWindow = true;
		this.activeWindow = win;

		this.mon(win, 'close', function() {
			delete me.hasAvailableWindow;
			delete me.activeWindow;

			history.pushState({library: {activeWindow: null}});
		});

		history.pushState({active: 'library', library: {activeWindow: state}});
	},


	setEnrolledCourses: function(current, archived) {
		this.currentCourses = current;
		this.archivedCourses = archived;

		var currentCmp = this.body.down('[id=current-courses-page]'),
			archivedCmp = this.body.down('[id=archived-courses-page]');

		if (currentCmp) {
			currentCmp.setItems(current);
		}

		if (archivedCmp) {
			archivedCmp.setItems(archived);
		}

		if (!Ext.isEmpty(current) || !Ext.isEmpty(archived)) {
			this.loadCourses = Promise.resolve(true);
			this.navigation.enableCourses();
		} else {
			this.loadCourses = Promise.reject('No Courses');
		}

		this.maybeFinishLoad();
	},


	setAdministeredCourses: function(current, archived) {
		if (!Ext.isEmpty(current) || !Ext.isEmpty(archived)) {
			this.navigation.enableAdmin();

			this.loadAdmin = Promise.resolve(true);
		} else {
			this.loadAdmin = Promise.reject();
		}

		this.maybeFinishLoad();

		this.currentAdministered = current;
		this.archivedAdministered = archived;

		var currentCmp = this.body.down('[id=current-admins-page]'),
			archivedCmp = this.body.down('[id=archived-admins-page]');

		if (currentCmp) {
			currentCmp.setItems(current);
		}

		if (archivedCmp) {
			archivedCmp.setItems(archived);
		}
	},


	setBookStore: function(store) {
		this.bookStore = store;

		if (store.getCount() > 0) {
			this.navigation.enableBooks();
			this.loadBooks = Promise.resolve(true);
		} else {
			this.loadBooks = Promise.reject(false);
		}

		this.maybeFinishLoad();

		var bookCmp = this.body.down('[id=books]');

		if (bookCmp) {
			bookCmp.setBookStore(store);
		}
	},


	setPurchasables: function(store) {
		if (store.getCount()) {
			this.navigation.allowBookAdd = !isFeature('hide-add-books');
			this.navigation.updateAvailable();

			this.navigation.enableBooks();
			this.loadPurchasables = Promise.resolve(true);
		} else {
			this.loadPurchasables = Promise.reject(false);
		}

		this.maybeFinishLoad();

		this.purchasables = store;

		if (this.activeWindow && this.activeWindow.is('library-available-books')) {
			this.activeWindow.setItems(store);
		}


	},


	setAvailableCourses: function(current, upcoming, archived) {
		if (!Ext.isEmpty(current) || !Ext.isEmpty(upcoming) || !Ext.isEmpty(archived)) {
			this.navigation.enableCourses();
			this.navigation.allowCourseAdd = true;
			this.navigation.updateAvailable();
			this.loadAvailable = Promise.resolve();
		} else {
			this.loadAvailable = Promise.reject('No Available');
		}


		this.currentAvailable = current;
		this.upcomingAvailable = upcoming;
		this.archivedAvailable = archived;

		if (this.activeWindow && this.activeWindow.is('library-available-courses-window')) {
			this.activeWindow.updateAvailableCourses(current, upcoming, archived);
		}
	},


	maybeFinishLoad: function() {
		if (!this.loadCourses || !this.loadAdmin || !this.loadBooks || !this.loadPurchasables || !this.loadAvailable) {
			return;
		}

		var me = this,
			active = me.stateObj.activeView;

		this.loadAdmin
			.then(function() {
				if (!active || active === 'admincourses') {
					active = 'admincourses';
					me.showMyAdminCourses();
					me.navigation.setView('admins');
				}
			})
			.fail(function() {
				if (active === 'admincourses') {
					active = '';
				}

				return me.loadCourses;
			})
			.then(function() {
				if (!active || active === 'mycourses') {
					active = 'mycourses';
					me.showMyCourses();
					me.navigation.setView('courses');
				}
			})
			.fail(function() {
				if (active === 'mycourses') {
					active = '';
				}

				return me.loadAvailable;
			})
			.then(function() {
				if (!active || active === 'mycourses') {
					active = 'mycourses';
					me.showMyCourses();
					me.navigation.setView('courses');
				}
			})
			.fail(function() {
				if (active === 'mycourses') {
					active = '';
				}

				return me.loadBooks;
			})
			.then(function() {
				if (!active || active === 'books') {
					active = 'books';
					me.showMyBooks();
					me.navigation.setView('books');
				}
			})
			.fail(function() {
				if (active === 'books') {
					active = '';
				}

				return me.loadPurchasables;
			})
			.then(function() {
				if (!active || active === 'books') {
					active = 'books';
					me.showMyBooks();
					me.navigation.setView('books');
				}
			});
	},


	maybeRestoreState: function() {
		this.maybeFinishLoad();
	}
});
