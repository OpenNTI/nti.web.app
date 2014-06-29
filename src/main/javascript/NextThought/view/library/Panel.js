Ext.define('NextThought.view.library.Panel', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.library-view-panel',

	requires: [
		'NextThought.view.library.CoursePage',
		'NextThought.view.library.BookPage',
		'NextThought.view.library.Navigation',
		'NextThought.view.library.available.Window'
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

		this.showMyCourses();
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

	},


	showAvailable: function() {
		var win = Ext.widget('library-available', {
			current: this.currentAvailable,
			upcoming: this.upcomingAvailable,
			archived: this.archivedAvailable
		});

		win.showBy(this, 'tl-tl', [this.leftSide, 40]);
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
	},


	setPurchasables: function(store) {

	},


	setAvailableCourses: function(current, upcoming, archived) {
		this.currentAvailable = current;
		this.upcomingAvailable = upcoming;
		this.archivedAvailable = archived;

		if (this.availableWin) {
			thia.availableWin.setCourses(current, upcoming, acrhived);
		}
	},


	setBookStore: function(store) {
		this.bookStore = store;

		var bookCmp = this.body.down('[id=books]');

		if (bookCmp) {
			bookCmp.setBookStore(store);
		}
	}
});
