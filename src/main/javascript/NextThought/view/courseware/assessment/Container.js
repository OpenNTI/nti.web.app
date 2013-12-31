Ext.define('NextThought.view.courseware.assessment.Container', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-container',
	requires: [
		'NextThought.view.courseware.assessment.View',
		'NextThought.view.courseware.assessment.admin.reader.Panel'
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
		this.on('show-assignment', 'showAssignment');
	},


	showRoot: function() {
		this.getLayout().setActiveItem(0);
		Ext.destroy(this.items.getRange(1));
	},


	showAssignment: function(view, assignement, assignemntHistory, student, path, store, page) {
		Ext.destroy(this.down('course-assessment-admin-reader'));
		this.mon(this.add({
			xtype: 'course-assessment-admin-reader',
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
