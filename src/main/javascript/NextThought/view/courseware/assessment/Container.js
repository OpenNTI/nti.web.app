Ext.define('NextThought.view.courseware.assessment.Container', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-container',
	requires: [
		'NextThought.view.courseware.assessment.View',
		'NextThought.view.courseware.assessment.admin.reader.Panel',
		'NextThought.view.courseware.assessment.reader.Panel'
	],

	items: [{
		title: 'Assignments',
		id: 'course-assessment-root',
		xtype: 'course-assessment'
	}],

	layout: 'card',
	onAdd: function(item) { this.getLayout().setActiveItem(item); },


	initComponent: function() {
		this.callParent(arguments);
		this.on({
			'show-assignment': 'showAssignment',
			'update-assignment-view': 'maybeUpdateAssignmentView'
		});
	},


	showRoot: function() {
		this.getLayout().setActiveItem(0);
		Ext.destroy(this.items.getRange(1));
	},


	maybeUpdateAssignmentView: function(view, store){
		var reader = this.down('reader');

		if (!reader || !reader.parentView.isDestroyed) { return; }
		
		if (reader.parentView.xtype === view.xtype) {
			reader.parentView = view;
			reader.store = store;
			reader.down('course-assessment-header').store = store;
		}
	},


	showAssignment: function(view, assignement, assignemntHistory, student, path, store, page) {
		//both course-asessment-reader and the admin-reader extend the reader so this takes care of both
		Ext.destroy(this.down('reader'));
		this.mon(this.add({
			xtype: (isMe(student))?  'course-assessment-reader' : 'course-assessment-admin-reader',
			parentView: view,
			assignmentHistory: assignemntHistory,
			student: student,
			path: path,
			store: store,
			page: page,
			location: assignement.getId(),
			assignment: assignement
		}), {
			'goup': 'showRoot'
		});
	},


	courseChanged: function() {
		var args = arguments;
		this.showRoot();
		this.items.each(function(o) {
			try {
				o.courseChanged.apply(o, args);
			} catch (e) {
				console.error(e.stack || e.message || e);
			}
		});
	}
});
