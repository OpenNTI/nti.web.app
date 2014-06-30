Ext.define('NextThought.view.library.Panel', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.library-view-panel',

	requires: [
		'NextThought.view.library.CoursePage',
		'NextThought.view.library.BookPage',
		'NextThought.view.library.Navigation',
		'NextThought.view.library.available.*'
	],

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
	},


	changeView: function(view) {
		var cmp = this.down('[id="' + view + '"]');

		this.body.getLayout().setActiveItem(cmp);

		//if it was successful
		if (this.body.getLayout().getActiveItem() === cmp) {
			this.navigation.updateSelection(view);
		}
	},


	showMyCourses: function() {
		if (this.noCourses) { return; }

		this.navigation.setItems([
			{label: 'Current and Upcoming', viewId: 'current-courses-page'},
			{label: 'Completed', viewId: 'completed-courses-page'}
		]);

		this.body.removeAll(true);
		this.body.add([
			{
				xtype: 'library-view-course-page',
				id: 'current-courses-page',
				groupLabel: 'current',
				courses: this.currentCourses || [],
				emptyText: 'You are not currently enrolled an any courses'
			},
			{
				xtype: 'library-view-course-page',
				id: 'completed-courses-page',
				groupLabel: 'completed',
				courses: this.completedCourses || [],
				emptyText: 'You have not completed any courses'
			}
		]);

		this.changeView('current-courses-page');
	},


	showMyAdminCourses: function() {
		this.navigation.setItems([
			{label: 'Current and Upcoming', viewId: 'current-admins-page'},
			{label: 'Completed', viewId: 'completed-admins-page'}
		]);

		this.body.removeAll(true);
		this.body.add([
			{
				xtype: 'library-view-course-page',
				id: 'current-admins-page',
				groupLabel: 'current',
				courses: this.currentAdministered || [],
				emptyText: 'You are not an administraighter of any courses'
			},
			{
				xtype: 'library-view-course-page',
				id: 'completed-admins-page',
				groupLabel: 'completed',
				courses: this.completedAdministered || [],
				emptyText: 'You have never been an administratorated a courses'
			}
		]);

		this.changeView('current-admins-page');
	},


	showMyBooks: function() {
		this.navigation.setItems([]);

		this.body.removeAll(true);
		this.body.add({
			xtype: 'library-view-book-page',
			id: 'books',
			books: this.bookStore,
			emptyText: 'You dont have any books'
		});

		this.changeView('books');
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


	setEnrolledCourses: function(current, completed) {
		this.currentCourses = current;
		this.completedCourses = completed;

		var currentCmp = this.body.down('[id=current-courses-page]'),
			completedCmp = this.body.down('[id=completed-courses-page]');

		if (currentCmp) {
			currentCmp.setItems(current);
		}

		if (completedCmp) {
			completedCmp.setItems(completed);
		}

		if (this.hasDroppedMask) {
			this.el.unmask();
		}
	},


	setAdministeredCourses: function(current, completed) {
		if (!Ext.isEmpty(current) || !Ext.isEmpty(completed)) {
			this.navigation.enableAdmin();
		}

		this.currentAdministered = current;
		this.completedAdministered = completed;

		var currentCmp = this.body.down('[id=current-admins-page]'),
			completedCmp = this.body.down('[id=comleted-admins-page]');

		if (currentCmp) {
			currentCmp.setItems(current);
		}

		if (completedCmp) {
			completedCmp.setItems(completed);
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
		}

		this.purchasables = store;

		this.maybeEnableBooks();
	},


	setAvailableCourses: function(current, upcoming, archived) {
		if (!Ext.isEmpty(current) || !Ext.isEmpty(upcoming) || !Ext.isEmpty(archived)) {
			this.navigation.allowCourseAdd = true;
		}


		this.currentAvailable = current;
		this.upcomingAvailable = upcoming;
		this.archivedAvailable = archived;

		if (this.availableWin) {
			thia.availableWin.setCourses(current, upcoming, acrhived);
		}
	},


	/**
	 * If courses is true enable the my courses tab, if not don't enable it and maybe enable the books tab
	 * @param  {boolean} courses whether or not there are courses
	 * @return {undefined}
	 */
	maybeEnableCourses: function(courses) {
		//if there are no courses
		if (!courses) {
			this.noCourses = true;

			if (this.noBooks) {
				console.error('!!!User has no courses or books!!!');
			} else if (this.hasBooks) {
				//if we are empty and we have books show the books view
				this.showMyBooks();
			}

			return;
		}

		//if we haven't already enable courses and make it the active view
		if (!this.hasCourses) {
			this.hasCourses = true;
			this.navigation.enableCourses();
			this.showMyCourses();
		}
	},


	maybeEnableBooks: function() {
		//if we already know we have books don't check again
		if (this.hasBooks) { return; }

		var isEmpty = true;

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

			return;
		}

		//since we haven't already enable books and if we don't have courses make it the active view
		this.hasBooks = true;
		this.navigation.enableBooks();

		//if we don't have courses yet show the books view
		if (!this.hasCourses) {
			this.showMyBooks();
		}
	}
});
