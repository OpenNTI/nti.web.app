Ext.define('NextThought.view.courseware.assessment.admin.performance.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-performance',
	requires: [
		'NextThought.view.courseware.assessment.admin.performance.Root',
		'NextThought.view.courseware.assessment.admin.performance.Student',
		'NextThought.proxy.courseware.PagedPageSource'
	],

	layout: 'card',
	onAdd: function(item) { this.getLayout().setActiveItem(item); },


	restoreState: function(state, active) {
		if (state && state.activeStudent) {
			this.findAndShowStudent(state.activeStudent);
		} else if (active) {
			this.showRoot();
		}

		var activeItem = this.getLayout().getActiveItem();

		this.items.each(function(item) {
			if (item.restoreState) {
				item.restoreState(state, activeItem === item);
			}
		});
	},


	setAssignmentsData: function() {
		this.clearAssignmentsData();
		var root = this.add({ xtype: 'course-assessment-admin-performance-root', pushState: this.pushState}),
			p = root.setAssignmentsData.apply(root, arguments);

		this.pushState({
			activeStudent: null
		});

		this.assignmentsData = Ext.Array.clone(arguments);
		this.store = root.store;
		this.mon(root, 'student-clicked', 'showStudentFromClick');
		return p;
	},

	clearAssignmentsData: function() {
		this.removeAll(true);
	},


	getRoot: function() {
		return this.items.first();
	},


	showRoot: function() {
		var root = this.getRoot(),
			layout = this.getLayout(),
			active = layout.getActiveItem();

		if (root !== active) {
			layout.setActiveItem(root);
			Ext.destroy(this.items.getRange(1));
		}

		this.pushState({
			activeStudent: null
		});
	},


	showStudentFromClick: function(view, rec) {
		this.showStudent(rec);
	},


	showStudent: function(rec) {
		var view,
			user = rec.get('User'),
			historyURL = rec.getLink('AssignmentHistory');

		if (!user || !historyURL) {
			console.warn('Unable to show student view', rec.get('User'), historyURL);
			return;
		}

		if (this.activeId !== NextThought.model.User.getIdFromRaw(user)) {
			this.pushState({
				activeStudent: NextThought.model.User.getIdFromRaw(user)
			});
		}

		Ext.destroy(this.down('course-assessment-admin-performance-student'));

		view = this.add({
			xtype: 'course-assessment-admin-performance-student',
			student: user,
			historiesURL: historyURL,
			FinalGradeHistoryItem: rec.get('HistoryItemSummary'),
			container: this,
			pageSource: NextThought.proxy.courseware.PagedPageSource.create({
				store: this.store,
				startingRec: rec
			})
		});

		view.setAssignmentsData.apply(view, this.assignmentsData);

		this.mon(view, {
			'goto': 'showStudent',
			'goup': 'showRoot'
		});
	},


	findAndShowStudent: function(username) {
		var record;

		if (this.store.loading) {
			this.mon(this.store, {
				'records-filled-in': this.findAndShowStudent.bind(this, username),
				single: true
			});

			return;
		}

		record = this.store.findBy(function(rec) {
			var user = rec.get('User');

			return username === NextThought.model.User.getIdFromRaw(user);
		});

		this.acitveId = username;

		if (record >= 0) {
			return this.showStudent(this.store.getAt(record), true);
		}

		console.log('Load the store to the correct page');
	}
});
