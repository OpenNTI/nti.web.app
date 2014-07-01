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
		CSSUtils.set(this.cssRule, {width: 'auto'}, true);
	},


	updateSidePadding: function(sides) {
		function toPx(i) { return (i && i + 'px') || i; }

		this.leftSide = sides.left;

		CSSUtils.set(this.cssRule, {
			paddingLeft: toPx(sides.left),
			paddingRight: toPx(sides.right)
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

		this.maybeRestoreState();
	},


	getState: function() {
		return this.stateObj;
	},


	applyState: function(state) {
		this.stateObj = state;

		if (state.activeView === 'mycourses') {
			this.showMyCourses();
			this.navigation.setDefault('courses');
		} else if (state.activeView === 'admincourses') {
			this.showMyAdminCourses();
			this.navigation.setDefault('admin');
		} else if (state.activeView === 'books') {
			this.showMyBooks();
			this.navigation.setDefault('books');
		}
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
				emptyText: 'You are not currently enrolled in any courses.'
			},
			{
				xtype: 'library-view-course-page',
				id: 'archived-courses-page',
				groupLabel: 'archived',
				courses: this.archivedCourses || [],
				emptyText: 'You don\'t have any archived courses.'
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
			emptyText: 'You don\'t have any books'
		});

		this.stateObj.activeView = 'books';
		this.saveState();
	},


	showAvailable: function(isBook) {
		var me = this,
			win, cfg, xtype;

		if (isBook) {
			xtype = 'library-available-books';

			cfg = {
				store: this.purchasables
			};
		} else {
			xtype = 'library-available-courses';

			cfg = {
				current: this.currentAvailable,
				upcoming: this.upcomingAvailable,
				archived: this.archivedAvailable
			};
		}

		win = Ext.widget(xtype, cfg);

		win.showBy(this, 'tl-tl', [this.leftSide, 40]);

		this.hasAvailableWindow = true;
		this.mon(win, 'close', function() {
			delete me.hasAvailableWindow;
		});
	},


	courseDropped: function() {
		if (this.el && !this.hasAvailableWindow) {
			this.hasDroppedMask = true;
			this.el.mask('Loading...');
		}
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

		if (this.hasDroppedMask) {
			this.el.unmask();
		}
	},


	setAdministeredCourses: function(current, archived) {
		if (!Ext.isEmpty(current) || !Ext.isEmpty(archived)) {
			this.navigation.enableAdmin();
		}

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

		if (this.hasDropMask) {
			this.el.unmask();
		}
	},


	setBookStore: function(store) {
		this.bookStore = store;

		this.maybeEnableBooks();

		var bookCmp = this.body.down('[id=books]');

		if (bookCmp) {
			bookCmp.setBookStore(store);
		}
	},


	setPurchasables: function(store) {
		if (store.getCount()) {
			this.navigation.allowBookAdd = true;
			this.navigation.updateAvailable();
		}

		this.purchasables = store;

		this.maybeEnableBooks();
	},


	setAvailableCourses: function(current, upcoming, archived) {
		if (!Ext.isEmpty(current) || !Ext.isEmpty(upcoming) || !Ext.isEmpty(archived)) {
			this.navigation.allowCourseAdd = true;
			this.navigation.updateAvailable();
		}


		this.currentAvailable = current;
		this.upcomingAvailable = upcoming;
		this.archivedAvailable = archived;
	},


	/**
	 * Mark if we have any courses or not
	 * @param  {boolean} courses whether or not there are courses
	 */
	maybeEnableCourses: function(courses) {
		//is there isn't an active view or courses is the active view
		var isActive = !this.stateObj.activeView || this.stateObj.activeView === 'mycourses';

		if (!courses) {
			this.noCourses = true;

			if (this.noBooks) {
				console.error('!!!User has no courses or books!!!');
			}
		} else if (!this.hasCourses) {//if we haven't already enable courses and make it the active view if it is the active tab
			this.hasCourses = true;
			this.navigation.enableCourses();
		}
	},


	maybeEnableBooks: function() {
		//if we already know we have books don't check again
		if (this.hasBooks) { return; }

		var isEmpty = true,
			//if there isn't an activeView yet or books is the active view
			isActive = !this.stateObj.activeView || this.stateObj.activeView === 'books';

		//if the bookstore is set and it has items its not empty
		if (this.bookStore && this.bookStore.getCount()) { isEmpty = false; }

		//if the purchasables is set and it has items its not empty
		if (this.purchasables && this.purchasables.getCount()) { isEmpty = false; }

		//if its still empty but either the bookstore or the purchasables hasn't been set yet
		//don't do anything
		if (isEmpty && (!this.bookStore || !this.purchasables)) { return; }

		if (isEmpty) {
			this.noBooks = true;

			if (this.noCoureses) {
				console.error('!!!User has no courses or books');
			}
		} else {
			//since we haven't already enable books and if we don't have courses make it the active view
			this.hasBooks = true;
			this.navigation.enableBooks();
		}
	},


	maybeRestoreState: function() {
		var active = this.stateObj.activeView;

		//if we tried to restore to my courses but we don't have any show my books if we have any
		if (this.noCourses && active === 'mycourses') {
			if (this.hasBooks) {
				this.showMyBooks();
			} else {
				console.error('No Courses or Books in the library');
			}

			return;
		}

		//if we tried to restore to my books but we don't have any show my courses if we have any
		if (this.noBooks && active === 'books') {
			if (this.hasCourses) {
				this.showMyCourses();
			} else {
				console.error('No Books or Courses in the library');
			}

			return;
		}

		//if we didn't try to restore a state and we have courses show my courses
		if (this.hasCourses && !active) {
			this.showMyCourses();
			this.navigation.setDefault('courses');
			return;
		}

		//if we didn't try to restore a state and we have books but not courses show my books
		if (this.hasBooks && !active) {
			this.showMyBooks();
			this.navigation.setDefault('books');
			return;
		}
	}
});
